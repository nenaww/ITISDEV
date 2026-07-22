package com.kabalikat.prototype

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.work.Worker
import androidx.work.WorkerParameters
import java.text.NumberFormat
import java.util.Locale

class BillReminderWorker(
    appContext: Context,
    workerParameters: WorkerParameters
) : Worker(
    appContext,
    workerParameters
) {

    override fun doWork(): Result {
        val billId = inputData.getString(
            BillReminderScheduler.KEY_BILL_ID
        ) ?: return Result.failure()

        val title = inputData.getString(
            BillReminderScheduler.KEY_TITLE
        ) ?: "Payment"

        val provider = inputData.getString(
            BillReminderScheduler.KEY_PROVIDER
        ).orEmpty()

        val amount = inputData.getDouble(
            BillReminderScheduler.KEY_AMOUNT,
            0.0
        )

        val dueDate = inputData.getString(
            BillReminderScheduler.KEY_DUE_DATE
        ).orEmpty()

        val frequency = inputData.getString(
            BillReminderScheduler.KEY_FREQUENCY
        ) ?: "one-time"

        val daysBefore = inputData.getInt(
            BillReminderScheduler.KEY_DAYS_BEFORE,
            0
        )

        val preferredDay = inputData.getInt(
            BillReminderScheduler.KEY_PREFERRED_DAY,
            1
        )

        /*
         * The reminder that runs on the due date
         * schedules the next occurrence for recurring
         * bills.
         */
        if (daysBefore == 0) {
            BillReminderScheduler
                .scheduleNextOccurrence(
                    context = applicationContext,
                    bill = BillReminderData(
                        id = billId,
                        title = title,
                        provider = provider,
                        amount = amount,
                        dueDate = dueDate,
                        frequency = frequency,
                        preferredDay = preferredDay
                    )
                )
        }

        createNotificationChannel(
            applicationContext
        )

        /*
         * Android 13 and newer require notification
         * permission.
         */
        if (
            Build.VERSION.SDK_INT >=
            Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(
                applicationContext,
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return Result.success()
        }

        val notificationTitle = when (
            daysBefore
        ) {
            5 -> "$title is due in 5 days"
            3 -> "$title is due in 3 days"
            1 -> "$title is due tomorrow"
            else -> "$title is due today"
        }

        val philippineLocale =
            Locale.forLanguageTag("en-PH")

        val amountText = NumberFormat
            .getCurrencyInstance(philippineLocale)
            .format(amount)

        val notificationBody = buildString {
            if (provider.isNotBlank()) {
                append(provider)
                append(" • ")
            }

            append(amountText)
        }

        /*
         * Opens bills.html when the user taps the
         * notification.
         */
        val openBillsIntent = Intent(
            applicationContext,
            MainActivity::class.java
        ).apply {
            putExtra(
                "openPage",
                "bills.html"
            )

            flags =
                Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP
        }

        val requestCode =
            "$billId-$dueDate-$daysBefore"
                .hashCode()

        val pendingIntent =
            PendingIntent.getActivity(
                applicationContext,
                requestCode,
                openBillsIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or
                        PendingIntent.FLAG_IMMUTABLE
            )

        val notification =
            NotificationCompat.Builder(
                applicationContext,
                CHANNEL_ID
            )
                .setSmallIcon(
                    R.drawable.ic_stat_kabalikat
                )
                .setContentTitle(
                    notificationTitle
                )
                .setContentText(
                    notificationBody
                )
                .setStyle(
                    NotificationCompat
                        .BigTextStyle()
                        .bigText(
                            "$notificationBody\n" +
                                    "Due date: $dueDate"
                        )
                )
                .setPriority(
                    NotificationCompat.PRIORITY_HIGH
                )
                .setCategory(
                    NotificationCompat.CATEGORY_REMINDER
                )
                .setContentIntent(
                    pendingIntent
                )
                .setAutoCancel(true)
                .build()

        return try {
            NotificationManagerCompat
                .from(applicationContext)
                .notify(
                    requestCode,
                    notification
                )

            Result.success()
        } catch (_: SecurityException) {
            Result.success()
        }
    }

    companion object {

        const val CHANNEL_ID =
            "kabalikat_bill_reminders"

        fun createNotificationChannel(
            context: Context
        ) {
            val channel =
                NotificationChannel(
                    CHANNEL_ID,
                    "Bill and Debt Reminders",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description =
                        "Reminders 5 days, 3 days, " +
                                "1 day, and on the payment due date"

                    enableVibration(true)
                }

            val notificationManager =
                context.getSystemService(
                    Context.NOTIFICATION_SERVICE
                ) as NotificationManager

            notificationManager.createNotificationChannel(
                channel
            )
        }
    }
}