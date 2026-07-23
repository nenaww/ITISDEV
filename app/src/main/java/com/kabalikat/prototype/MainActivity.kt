package com.kabalikat.prototype

import android.Manifest
import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.graphics.scale
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.documentscanner.GmsDocumentScanning
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions
import com.google.mlkit.vision.documentscanner.GmsDocumentScanningResult
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import org.json.JSONObject
import java.util.concurrent.Executors

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var ocrBridge: OcrBridge
    private lateinit var documentScannerBridge: DocumentScannerBridge

    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private val ocrExecutor = Executors.newSingleThreadExecutor()

    private val fileChooserLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val results = WebChromeClient.FileChooserParams.parseResult(
                result.resultCode,
                result.data
            )

            filePathCallback?.onReceiveValue(results)
            filePathCallback = null
        }

    private val notificationPermissionLauncher =
        registerForActivityResult(
            ActivityResultContracts.RequestPermission()
        ) { granted ->
            if (!granted) {
                Toast.makeText(
                    this,
                    "Notifications are disabled. Bills will still be saved, but reminders will not appear.",
                    Toast.LENGTH_LONG
                ).show()
            }
        }

    private val documentScannerLauncher =
        registerForActivityResult(ActivityResultContracts.StartIntentSenderForResult()) { result ->
            if (result.resultCode != RESULT_OK) {
                sendDocumentScannerResult(
                    success = false,
                    imageDataUrl = "",
                    error = "Document scan was cancelled."
                )
                return@registerForActivityResult
            }

            try {
                val scanResult = GmsDocumentScanningResult.fromActivityResultIntent(result.data)
                val pages = scanResult?.pages
                val firstPageUri = pages?.firstOrNull()?.imageUri

                if (firstPageUri == null) {
                    sendDocumentScannerResult(
                        success = false,
                        imageDataUrl = "",
                        error = "No scanned receipt image was returned."
                    )
                    return@registerForActivityResult
                }

                val dataUrl = uriToImageDataUrl(firstPageUri)

                sendDocumentScannerResult(
                    success = true,
                    imageDataUrl = dataUrl,
                    error = ""
                )

                ocrBridge.scanReceipt(dataUrl)
            } catch (error: Exception) {
                sendDocumentScannerResult(
                    success = false,
                    imageDataUrl = "",
                    error = error.message ?: "Could not read scanned receipt image."
                )
            }
        }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (::webView.isInitialized && webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        val isDebuggable =
            applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0

        WebView.setWebContentsDebuggingEnabled(isDebuggable)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            mediaPlaybackRequiresUserGesture = false
        }

        ocrBridge = OcrBridge(webView)
        documentScannerBridge = DocumentScannerBridge()

        webView.addJavascriptInterface(ocrBridge, "AndroidOCR")
        webView.addJavascriptInterface(documentScannerBridge, "AndroidScanner")
        webView.addJavascriptInterface(BillCalendarBridge(this), "KabalikatAndroid")

        BillReminderWorker.createNotificationChannel(this)
        webView.webViewClient = object : WebViewClient() {

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: android.webkit.WebResourceRequest?
            ): Boolean {
                val uri = request?.url ?: return true
                val url = uri.toString()

                val isInternalPage =
                    url.startsWith("file:///android_asset/www/")

                if (isInternalPage) {
                    return false
                }

                return try {
                    val externalIntent = Intent(
                        Intent.ACTION_VIEW,
                        uri
                    )

                    startActivity(externalIntent)
                    true
                } catch (_: ActivityNotFoundException) {
                    true
                }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                return try {
                    val intent = fileChooserParams?.createIntent()

                    if (intent != null) {
                        fileChooserLauncher.launch(intent)
                        true
                    } else {
                        this@MainActivity.filePathCallback?.onReceiveValue(null)
                        this@MainActivity.filePathCallback = null
                        false
                    }
                } catch (_: Exception) {
                    this@MainActivity.filePathCallback?.onReceiveValue(null)
                    this@MainActivity.filePathCallback = null
                    false
                }
            }
        }

        val requestedPage =
            intent.getStringExtra("openPage")
                ?: "index.html"

        loadInternalPage(requestedPage)
    }

    fun ensureNotificationPermission() {
        if (
            Build.VERSION.SDK_INT >=
            Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            notificationPermissionLauncher.launch(
                Manifest.permission.POST_NOTIFICATIONS
            )
        }
    }

    private fun loadInternalPage(
        requestedPage: String?
    ) {
        val allowedPage = when (requestedPage) {
            "bills.html" -> "bills.html"
            "index.html" -> "index.html"
            else -> "index.html"
        }

        webView.loadUrl(
            "file:///android_asset/www/$allowedPage"
        )
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)

        val requestedPage =
            intent.getStringExtra("openPage")
                ?: return

        loadInternalPage(requestedPage)
    }

    inner class DocumentScannerBridge {

        @Suppress("unused")
        @JavascriptInterface
        fun startDocumentScan() {
            runOnUiThread {
                try {
                    val options = GmsDocumentScannerOptions.Builder()
                        .setGalleryImportAllowed(true)
                        .setPageLimit(1)
                        .setResultFormats(GmsDocumentScannerOptions.RESULT_FORMAT_JPEG)
                        .setScannerMode(GmsDocumentScannerOptions.SCANNER_MODE_FULL)
                        .build()

                    val scanner = GmsDocumentScanning.getClient(options)

                    scanner.getStartScanIntent(this@MainActivity)
                        .addOnSuccessListener { intentSender ->
                            val request = IntentSenderRequest.Builder(intentSender).build()
                            documentScannerLauncher.launch(request)
                        }
                        .addOnFailureListener { error ->
                            sendDocumentScannerResult(
                                success = false,
                                imageDataUrl = "",
                                error = error.message ?: "Document scanner failed to start."
                            )
                        }
                } catch (error: Exception) {
                    sendDocumentScannerResult(
                        success = false,
                        imageDataUrl = "",
                        error = error.message ?: "Document scanner is unavailable."
                    )
                }
            }
        }
    }

    inner class OcrBridge(private val webView: WebView) {

        private val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

        @Suppress("unused")
        @JavascriptInterface
        fun scanReceipt(dataUrl: String) {
            ocrExecutor.execute {
                try {
                    val base64Text = dataUrl.substringAfter(",", dataUrl)
                    val imageBytes = Base64.decode(base64Text, Base64.DEFAULT)

                    val bitmap = BitmapFactory.decodeByteArray(
                        imageBytes,
                        0,
                        imageBytes.size
                    ) ?: throw IllegalArgumentException("Could not decode receipt image.")

                    runReceiptOcrPasses(bitmap)
                } catch (error: Exception) {
                    sendOcrResult(
                        success = false,
                        text = "",
                        error = error.message ?: "Image processing failed."
                    )
                }
            }
        }

        private fun runReceiptOcrPasses(originalBitmap: android.graphics.Bitmap) {
            val ocrBitmaps = buildReceiptOcrBitmaps(originalBitmap)
            val collectedTexts = mutableListOf<String>()

            fun processNext(index: Int) {
                if (index >= ocrBitmaps.size) {
                    val combinedText = mergeOcrTexts(collectedTexts)

                    sendOcrResult(
                        success = combinedText.isNotBlank(),
                        text = combinedText,
                        error = if (combinedText.isBlank()) "No readable receipt text was detected." else ""
                    )

                    ocrBitmaps.forEach { bitmap ->
                        if (bitmap != originalBitmap && !bitmap.isRecycled) {
                            bitmap.recycle()
                        }
                    }

                    return
                }

                val image = InputImage.fromBitmap(ocrBitmaps[index], 0)

                recognizer.process(image)
                    .addOnSuccessListener { visionText ->
                        if (visionText.text.isNotBlank()) {
                            collectedTexts.add(visionText.text)
                        }

                        processNext(index + 1)
                    }
                    .addOnFailureListener {
                        processNext(index + 1)
                    }
            }

            processNext(0)
        }

        private fun buildReceiptOcrBitmaps(originalBitmap: android.graphics.Bitmap): List<android.graphics.Bitmap> {
            val result = mutableListOf<android.graphics.Bitmap>()

            val uprightBitmap = resizeBitmapForOcr(originalBitmap, 2600)
            result.add(uprightBitmap)

            val width = uprightBitmap.width
            val height = uprightBitmap.height

            if (height < 1200) {
                return result
            }

            val sliceCount = if (height > width * 2.2) 5 else 3
            val overlap = (height * 0.06).toInt().coerceAtLeast(80)
            val sliceHeight = height / sliceCount

            for (index in 0 until sliceCount) {
                val rawTop = index * sliceHeight
                val top = (rawTop - overlap).coerceAtLeast(0)
                val bottom = if (index == sliceCount - 1) {
                    height
                } else {
                    ((index + 1) * sliceHeight + overlap).coerceAtMost(height)
                }

                val croppedHeight = bottom - top

                if (croppedHeight <= 100) continue

                val crop = android.graphics.Bitmap.createBitmap(
                    uprightBitmap,
                    0,
                    top,
                    width,
                    croppedHeight
                )

                val enlargedCrop = resizeBitmapForOcr(crop, 2200)

                if (enlargedCrop != crop && !crop.isRecycled) {
                    crop.recycle()
                }

                result.add(enlargedCrop)
            }

            return result
        }

        private fun resizeBitmapForOcr(
            bitmap: android.graphics.Bitmap,
            targetShortSide: Int
        ): android.graphics.Bitmap {
            val width = bitmap.width
            val height = bitmap.height
            val shortSide = minOf(width, height)

            if (shortSide >= targetShortSide) {
                return bitmap
            }

            val scale = targetShortSide.toFloat() / shortSide.toFloat()
            val newWidth = (width * scale).toInt()
            val newHeight = (height * scale).toInt()

            return bitmap.scale(
                newWidth,
                newHeight,
                true
            )
        }

        private fun mergeOcrTexts(texts: List<String>): String {
            val seen = linkedSetOf<String>()

            texts.forEach { text ->
                text.split("\n")
                    .map { line -> line.trim() }
                    .filter { line -> line.isNotBlank() }
                    .forEach { line ->
                        val key = line
                            .uppercase()
                            .replace(Regex("[^A-Z0-9]"), "")

                        if (key.length >= 2) {
                            seen.add(line)
                        }
                    }
            }

            return seen.joinToString("\n")
        }

        private fun sendOcrResult(success: Boolean, text: String, error: String) {
            val payload = JSONObject()
                .put("success", success)
                .put("text", text)
                .put("error", error)
                .toString()

            webView.post {
                webView.evaluateJavascript(
                    "window.handleMlKitOcrResult($payload);",
                    null
                )
            }
        }

        fun close() {
            recognizer.close()
        }
    }

    private fun uriToImageDataUrl(uri: Uri): String {
        val imageBytes = contentResolver.openInputStream(uri)?.use { inputStream ->
            inputStream.readBytes()
        } ?: throw IllegalArgumentException("Could not open scanned image.")

        val base64Image = Base64.encodeToString(imageBytes, Base64.NO_WRAP)

        return "data:image/jpeg;base64,$base64Image"
    }

    private fun sendDocumentScannerResult(success: Boolean, imageDataUrl: String, error: String) {
        val payload = JSONObject()
            .put("success", success)
            .put("imageDataUrl", imageDataUrl)
            .put("error", error)
            .toString()

        webView.post {
            webView.evaluateJavascript(
                "if (window.handleDocumentScannerResult) window.handleDocumentScannerResult($payload);",
                null
            )
        }
    }

    override fun onDestroy() {
        if (::ocrBridge.isInitialized) {
            ocrBridge.close()
        }

        if (::webView.isInitialized) {
            webView.apply {
                stopLoading()
                loadUrl("about:blank")
                removeJavascriptInterface("AndroidOCR")
                removeJavascriptInterface("AndroidScanner")
                removeJavascriptInterface("KabalikatAndroid")
                webChromeClient = null
                webViewClient = WebViewClient()
                destroy()
            }
        }

        ocrExecutor.shutdown()
        super.onDestroy()
    }
}