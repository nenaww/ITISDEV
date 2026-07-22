package com.kabalikat.prototype

import android.content.Context
import androidx.work.Data
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.concurrent.TimeUnit
import kotlin.math.min

data class BillReminderData(
    val id: String,
    val title: String,
    val provider: String,
    val amount: Double,
    val dueDate: String,
    val frequency: String,
    val preferredDay: Int? = null
)

object BillReminderScheduler {

    const val KEY_BILL_ID = "billId"
    const val KEY_TITLE = "title"
    const val KEY_PROVIDER = "provider"
    const val KEY_AMOUNT = "amount"
    const val KEY_DUE_DATE = "dueDate"
    const val KEY_FREQUENCY = "frequency"
    const val KEY_DAYS_BEFORE = "daysBefore"
    const val KEY_PREFERRED_DAY = "preferredDay"

    private const val BILL_TAG_PREFIX = "kabalikat-bill-"

    /*
     * Notifications are scheduled:
     * - 5 days before
     * - 3 days before
     * - 1 day before
     * - On the due date
     */
    private val REMINDER_DAYS = listOf(5, 3, 1, 0)

    fun scheduleBill(
        context: Context,
        bill: BillReminderData,
        cancelExisting: Boolean = true
    ) {
        val dueCalendar = parseDueDate(bill.dueDate) ?: return

        val preferredDay = bill.preferredDay
            ?: dueCalendar.get(Calendar.DAY_OF_MONTH)

        if (cancelExisting) {
            cancelBill(context, bill.id)
        }

        REMINDER_DAYS.forEach { daysBefore ->
            val reminderTime = dueCalendar.clone() as Calendar

            reminderTime.add(
                Calendar.DAY_OF_YEAR,
                -daysBefore
            )

            val delay =
                reminderTime.timeInMillis -
                        System.currentTimeMillis()

            /*
             * Do not schedule a reminder whose time has
             * already passed.
             *
             * Example:
             * If the bill is due in two days, only the
             * one-day and due-date reminders are scheduled.
             */
            if (delay <= 0L) {
                return@forEach
            }

            val inputData = Data.Builder()
                .putString(KEY_BILL_ID, bill.id)
                .putString(KEY_TITLE, bill.title)
                .putString(KEY_PROVIDER, bill.provider)
                .putDouble(KEY_AMOUNT, bill.amount)
                .putString(KEY_DUE_DATE, bill.dueDate)
                .putString(KEY_FREQUENCY, bill.frequency)
                .putInt(KEY_DAYS_BEFORE, daysBefore)
                .putInt(KEY_PREFERRED_DAY, preferredDay)
                .build()

            val workTag = billTag(bill.id)

            val request =
                OneTimeWorkRequestBuilder<BillReminderWorker>()
                    .setInputData(inputData)
                    .setInitialDelay(
                        delay,
                        TimeUnit.MILLISECONDS
                    )
                    .addTag(workTag)
                    .build()

            /*
             * Each reminder has its own unique work name.
             */
            val uniqueWorkName =
                "${workTag}_${bill.dueDate}_$daysBefore"

            WorkManager
                .getInstance(context)
                .enqueueUniqueWork(
                    uniqueWorkName,
                    ExistingWorkPolicy.REPLACE,
                    request
                )
        }
    }

    /*
     * Called by the due-date Worker after a recurring
     * bill reaches its due date.
     */
    fun scheduleNextOccurrence(
        context: Context,
        bill: BillReminderData
    ) {
        val frequency =
            bill.frequency.lowercase(Locale.US)

        if (
            frequency != "weekly" &&
            frequency != "monthly"
        ) {
            return
        }

        val currentDueDate =
            parseDueDate(bill.dueDate) ?: return

        val preferredDay = bill.preferredDay
            ?: currentDueDate.get(
                Calendar.DAY_OF_MONTH
            )

        var nextDueDate =
            currentDueDate.clone() as Calendar

        /*
         * Continue advancing the date until it is in
         * the future.
         */
        do {
            nextDueDate = advanceDate(
                current = nextDueDate,
                frequency = frequency,
                preferredDay = preferredDay
            )
        } while (
            nextDueDate.timeInMillis <=
            System.currentTimeMillis()
        )

        scheduleBill(
            context = context,
            bill = bill.copy(
                dueDate = formatDate(nextDueDate),
                preferredDay = preferredDay
            ),
            cancelExisting = false
        )
    }

    fun cancelBill(
        context: Context,
        billId: String
    ) {
        WorkManager
            .getInstance(context)
            .cancelAllWorkByTag(
                billTag(billId)
            )
    }

    private fun billTag(
        billId: String
    ): String {
        return "$BILL_TAG_PREFIX$billId"
    }

    /*
     * Bill reminders are scheduled for 9:00 AM.
     */
    private fun parseDueDate(
        value: String
    ): Calendar? {
        return try {
            val formatter = SimpleDateFormat(
                "yyyy-MM-dd",
                Locale.US
            ).apply {
                isLenient = false
            }

            val parsedDate =
                formatter.parse(value) ?: return null

            Calendar.getInstance().apply {
                time = parsedDate

                set(Calendar.HOUR_OF_DAY, 9)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }
        } catch (_: Exception) {
            null
        }
    }

    private fun formatDate(
        calendar: Calendar
    ): String {
        return SimpleDateFormat(
            "yyyy-MM-dd",
            Locale.US
        ).format(calendar.time)
    }

    private fun advanceDate(
        current: Calendar,
        frequency: String,
        preferredDay: Int
    ): Calendar {
        val next =
            current.clone() as Calendar

        when (frequency) {
            "weekly" -> {
                next.add(
                    Calendar.DAY_OF_YEAR,
                    7
                )
            }

            "monthly" -> {
                /*
                 * Set the date to day 1 first to avoid
                 * skipping a month for dates such as
                 * January 31.
                 */
                next.set(
                    Calendar.DAY_OF_MONTH,
                    1
                )

                next.add(
                    Calendar.MONTH,
                    1
                )

                val lastDayOfMonth =
                    next.getActualMaximum(
                        Calendar.DAY_OF_MONTH
                    )

                next.set(
                    Calendar.DAY_OF_MONTH,
                    min(
                        preferredDay,
                        lastDayOfMonth
                    )
                )
            }
        }

        return next
    }
}