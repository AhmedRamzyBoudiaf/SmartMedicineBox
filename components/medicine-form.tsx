"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { addReminderToFirebase, syncWithESP32 } from "@/lib/firebase-db-client"
import type { MedicineReminder } from "@/lib/medicine"

export function MedicineForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    try {
      const medicineName = formData.get("medicineName") as string
      const time1 = formData.get("time1") as string
      const time2 = (formData.get("time2") as string) || null
      const pillCount = formData.get("pillCount") as string
      const instructions = formData.get("instructions") as string

      if (!startDate || !endDate || !medicineName || !time1 || !pillCount || !instructions) {
        setError("Please fill all required fields")
        return
      }

      if (endDate < startDate) {
        setError("End date must be after start date")
        return
      }

      // Get user session from cookie
      const response = await fetch("/api/auth/session")
      const session = await response.json()

      if (!session || !session.user) {
        throw new Error("Not authenticated")
      }

      // Create the reminder object
      const newReminder: Omit<MedicineReminder, "id"> = {
        medicineName,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        times: [time1, ...(time2 ? [time2] : [])].filter(Boolean),
        pillCount: Number.parseInt(pillCount),
        instructions,
      }

      // Add to Firebase directly from client
      await addReminderToFirebase(session.user.uid, {
        ...newReminder,
        id: crypto.randomUUID(),
      })

      // Sync with ESP32
      await syncWithESP32(session.user.uid)

      // Reset form
      formData.forEach((_, key) => formData.delete(key))
      setStartDate(undefined)
      setEndDate(undefined)
      setStartDateOpen(false)
      setEndDateOpen(false)
      setError(null)

      // Refresh the page to show the new reminder
      router.refresh()
    } catch (error) {
      console.error("Failed to add reminder:", error)
      setError(error instanceof Error ? error.message : "Failed to add reminder. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medicineName">Medicine Name</Label>
            <Input id="medicineName" name="medicineName" placeholder="Enter medicine name" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date)
                        setStartDateOpen(false)
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date)
                        setEndDateOpen(false)
                      }
                    }}
                    initialFocus
                    disabled={(date) => (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time1">Reminder Time 1</Label>
              <Input id="time1" name="time1" type="time" defaultValue="07:30" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time2">Reminder Time 2 (Optional)</Label>
              <Input id="time2" name="time2" type="time" defaultValue="12:00" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pillCount">Number of Pills</Label>
            <Select name="pillCount" defaultValue="1">
              <SelectTrigger>
                <SelectValue placeholder="Select number of pills" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Pill</SelectItem>
                <SelectItem value="2">2 Pills</SelectItem>
                <SelectItem value="3">3 Pills</SelectItem>
                <SelectItem value="4">4 Pills</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Instructions</Label>
            <RadioGroup defaultValue="after" name="instructions">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="before" id="before" />
                <Label htmlFor="before">Before eating</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="after" id="after" />
                <Label htmlFor="after">After eating</Label>
              </div>
            </RadioGroup>
          </div>

          {error && <div className="p-3 mt-2 text-sm text-white bg-red-500 rounded-md">{error}</div>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Medicine Reminder"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

