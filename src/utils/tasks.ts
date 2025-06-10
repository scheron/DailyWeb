import {DateTime} from "luxon"

import type {ISODate} from "@/types/date"
import type {Day, DayItem, Label, Task} from "@/types/tasks"

type GroupTasksByDayParams = {
  tasks: Task[]
  days: DayItem[]
  labels: Label[]
}

export function groupTasksByDay(params: GroupTasksByDayParams): Day[] {
  const {tasks, days, labels} = params

  const tasksByDay = new Map<string, Task[]>()
  const labelsByDay = new Map<string, Label[]>()

  const labelsMap = new Map<Label["name"], Label>()

  for (const label of labels) {
    labelsMap.set(label.name, label)
  }

  for (const task of tasks) {
    const taskDate = task.scheduled.date
    const dayTasks = tasksByDay.get(taskDate) || []

    dayTasks.push(task)
    tasksByDay.set(taskDate, dayTasks)

    const taskLabels = task.labels.map((labelId) => labelsMap.get(labelId)).filter(Boolean)
    labelsByDay.set(taskDate, (taskLabels ?? []) as Label[])
  }

  return days.map((day) => {
    const tasks = tasksByDay.get(day.date) || []
    const labels = labelsByDay.get(day.date) || []
    const sortedTasks = sortScheduledTasks(tasks, "desc")
    const countActive = sortedTasks.filter((task) => task.status === "active").length
    const countDone = sortedTasks.filter((task) => task.status === "done").length

    return {
      id: day.id,
      date: day.date,
      subtitle: day.subtitle,
      countActive,
      countDone,
      tasks: sortedTasks,
      labels,
    }
  })
}

function sortScheduledTasks<T extends {scheduled: {date: ISODate; time?: string}}>(tasks: T[], direction: "asc" | "desc" = "asc"): T[] {
  return [...tasks].sort((a, b) => {
    const aTime = a.scheduled.time ?? "00:00"
    const bTime = b.scheduled.time ?? "00:00"
    const aMillis = DateTime.fromISO(`${a.scheduled.date}T${aTime}`).toMillis()
    const bMillis = DateTime.fromISO(`${b.scheduled.date}T${bTime}`).toMillis()
    return direction === "asc" ? aMillis - bMillis : bMillis - aMillis
  })
}
