package com.kabalikat.prototype

import android.content.ActivityNotFoundException
import android.content.Intent
import android.provider.CalendarContract
import android.webkit.JavascriptInterface
import android.widget.Toast
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.TimeZone

class BillCalendarBridge(
    private val activity: MainActivity
) {

    /**
     * Saves reminders and opens the Android Calendar event form.
     */
    @JavascriptInterface
    fun addBill(json: String): String {
        return try {
            val payload = JSONObject(json)

            val id = payload.getString("id")
            val type = payload.optString("type", "bill")
            val name = payload.getString("name")
            val provider = payload.optString("provider")
            val amount = payload.optDouble("amount", 0.0)
            val dueDate = payload.getString("dueDate")
            val frequency = payload.optString(
                "frequency",
                "one-time"
            )
            val reminder = payload.optBoolean(
                "reminder",
                true
            )
            val notes = payload.optString("notes")
            val category = payload.optString("category")

            if (reminder) {
                BillReminderScheduler.scheduleBill(
                    context = activity.applicationContext,
                    bill = BillReminderData(
                        id = id,
                        title = name,
                        provider = provider,
                        amount = amount,
                        dueDate = dueDate,
                        frequency = frequency
                    )
                )

                activity.runOnUiThread {
                    activity.ensureNotificationPermission()
                }
            } else {
                BillReminderScheduler.cancelBill(
                    activity.applicationContext,
                    id
                )
            }

            activity.runOnUiThread {
                openCalendarEvent(
                    type = type,
                    name = name,
                    provider = provider,
                    amount = amount,
                    dueDate = dueDate,
                    frequency = frequency,
                    category = category,
                    notes = notes
                )
            }

            "ok"
        } catch (error: Exception) {
            error.printStackTrace()
            "error:${error.message.orEmpty()}"
        }
    }

    /**
     * Reschedules reminders without opening Calendar.
     * Useful when an unpaid bill is restored.
     */
    @JavascriptInterface
    fun scheduleBillReminders(json: String): String {
        return try {
            val payload = JSONObject(json)

            BillReminderScheduler.scheduleBill(
                context = activity.applicationContext,
                bill = BillReminderData(
                    id = payload.getString("id"),
                    title = payload.getString("name"),
                    provider = payload.optString("provider"),
                    amount = payload.optDouble("amount", 0.0),
                    dueDate = payload.getString("dueDate"),
                    frequency = payload.optString(
                        "frequency",
                        "one-time"
                    )
                )
            )

            activity.runOnUiThread {
                activity.ensureNotificationPermission()
            }

            "ok"
        } catch (error: Exception) {
            "error:${error.message.orEmpty()}"
        }
    }

    @JavascriptInterface
    fun cancelBillReminders(billId: String): String {
        return try {
            BillReminderScheduler.cancelBill(
                activity.applicationContext,
                billId
            )

            "ok"
        } catch (error: Exception) {
            "error:${error.message.orEmpty()}"
        }
    }

    private fun openCalendarEvent(
        type: String,
        name: String,
        provider: String,
        amount: Double,
        dueDate: String,
        frequency: String,
        category: String,
        notes: String
    ) {
        val startCalendar = parseDueDate(dueDate)

        if (startCalendar == null) {
            Toast.makeText(
                activity,
                "The due date could not be added to Calendar.",
                Toast.LENGTH_LONG
            ).show()

            return
        }

        val endCalendar = startCalendar.clone() as Calendar
        endCalendar.add(Calendar.MINUTE, 30)

        val description = buildString {
            appendLine(
                "Type: ${
                    type.replaceFirstChar {
                        if (it.isLowerCase()) {
                            it.titlecase(Locale.US)
                        } else {
                            it.toString()
                        }
                    }
                }"
            )

            if (provider.isNotBlank()) {
                appendLine("Provider / Payee: $provider")
            }

            appendLine("Amount: ₱${"%,.2f".format(amount)}")

            if (category.isNotBlank()) {
                appendLine("Category: $category")
            }

            appendLine(
                "Frequency: ${
                    frequency.replaceFirstChar {
                        if (it.isLowerCase()) {
                            it.titlecase(Locale.US)
                        } else {
                            it.toString()
                        }
                    }
                }"
            )

            if (notes.isNotBlank()) {
                appendLine("Notes: $notes")
            }

            append("Created through KABALIKAT.")
        }

        val calendarIntent = Intent(
            Intent.ACTION_INSERT
        ).apply {
            data = CalendarContract.Events.CONTENT_URI

            putExtra(
                CalendarContract.Events.TITLE,
                "[KABALIKAT] $name Due"
            )

            putExtra(
                CalendarContract.Events.DESCRIPTION,
                description
            )

            putExtra(
                CalendarContract.EXTRA_EVENT_BEGIN_TIME,
                startCalendar.timeInMillis
            )

            putExtra(
                CalendarContract.EXTRA_EVENT_END_TIME,
                endCalendar.timeInMillis
            )

            putExtra(
                CalendarContract.Events.EVENT_TIMEZONE,
                TimeZone.getDefault().id
            )

            putExtra(
                CalendarContract.EXTRA_EVENT_ALL_DAY,
                false
            )

            when (frequency.lowercase(Locale.US)) {
                "weekly" -> {
                    putExtra(
                        CalendarContract.Events.RRULE,
                        "FREQ=WEEKLY"
                    )
                }

                "monthly" -> {
                    putExtra(
                        CalendarContract.Events.RRULE,
                        "FREQ=MONTHLY"
                    )
                }
            }
        }

        try {
            activity.startActivity(calendarIntent)

            Toast.makeText(
                activity,
                "Review the Calendar event, then tap Save.",
                Toast.LENGTH_LONG
            ).show()
        } catch (_: ActivityNotFoundException) {
            Toast.makeText(
                activity,
                "No Calendar application was found.",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    private fun parseDueDate(value: String): Calendar? {
        return try {
            val formatter = SimpleDateFormat(
                "yyyy-MM-dd",
                Locale.US
            ).apply {
                isLenient = false
            }

            val parsedDate = formatter.parse(value)
                ?: return null

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
}