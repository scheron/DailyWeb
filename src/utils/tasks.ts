import {DateTime} from "luxon"

import type {ISODate} from "@/types/date"
import type {Day, DayItem, Tag, Task} from "@/types/tasks"

type GroupTasksByDayParams = {
  tasks: Task[]
  days: DayItem[]
  tags: Tag[]
}

export function groupTasksByDay(params: GroupTasksByDayParams): Day[] {
  const {tasks, days, tags} = params

  const tasksByDay = new Map<string, Task[]>()
  const tagsByDay = new Map<string, Tag[]>()

  const tagsMap = new Map<Tag["id"], Tag>()

  for (const tag of tags) {
    tagsMap.set(tag.id, tag)
  }

  for (const task of tasks) {
    const taskDate = task.scheduled.date
    const dayTasks = tasksByDay.get(taskDate) || []

    dayTasks.push(task)
    tasksByDay.set(taskDate, dayTasks)

    const taskTags = task.tags.map(({id}) => tagsMap.get(id)).filter(Boolean) as Tag[]

    if (!tagsByDay.has(taskDate)) tagsByDay.set(taskDate, [])

    const newTags = tagsByDay.get(taskDate)!.concat(taskTags).filter(Boolean) as Tag[]
    tagsByDay.set(taskDate, newTags)
  }

  return days.map((day) => {
    const tasks = tasksByDay.get(day.date) || []
    const tags = tagsByDay.get(day.date) || []
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
      tags,
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
