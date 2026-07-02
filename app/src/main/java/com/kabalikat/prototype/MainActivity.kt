package com.kabalikat.prototype

import android.annotation.SuppressLint
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import org.json.JSONObject
import java.util.concurrent.Executors

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var ocrBridge: OcrBridge

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

        WebView.setWebContentsDebuggingEnabled(true)

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
        webView.addJavascriptInterface(ocrBridge, "AndroidOCR")

        webView.webViewClient = WebViewClient()

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

        webView.loadUrl("file:///android_asset/www/index.html")
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

                    val image = InputImage.fromBitmap(bitmap, 0)

                    recognizer.process(image)
                        .addOnSuccessListener { visionText ->
                            sendOcrResult(
                                success = true,
                                text = visionText.text,
                                error = ""
                            )
                        }
                        .addOnFailureListener { error ->
                            sendOcrResult(
                                success = false,
                                text = "",
                                error = error.message ?: "ML Kit OCR failed."
                            )
                        }
                } catch (error: Exception) {
                    sendOcrResult(
                        success = false,
                        text = "",
                        error = error.message ?: "Image processing failed."
                    )
                }
            }
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

    override fun onDestroy() {
        if (::ocrBridge.isInitialized) {
            ocrBridge.close()
        }

        ocrExecutor.shutdown()
        super.onDestroy()
    }
}