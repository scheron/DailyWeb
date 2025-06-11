import {DateTime} from "luxon"
import {nanoid} from "nanoid"

import {arrayRemoveDuplicates} from "@/utils/arrays"
import {LocalDB} from "@/utils/LocalDB"
import {groupTasksByDay} from "@/utils/tasks"

import type {ISODate} from "@/types/date"
import type {Storage} from "@/types/storage"
import type {Day, DayItem, Tag, Task} from "@/types/tasks"

function defineApi(): Storage {
  const db = new LocalDB("daily_tasks", [
    {
      name: "tasks",
      keyPath: "id",
      indexes: [
        {name: "id", keyPath: "id", options: {unique: true}},
        {name: "scheduled.date", keyPath: "scheduled.date", options: {unique: false}},
      ],
    },
    {
      name: "days",
      keyPath: "id",
      indexes: [
        {name: "id", keyPath: "id", options: {unique: true}},
        {name: "date", keyPath: "date", options: {unique: false}},
      ],
    },
    {
      name: "tags",
      keyPath: "id",
      indexes: [
        {name: "id", keyPath: "id", options: {unique: true}},
        {name: "name", keyPath: "name", options: {unique: true}},
      ],
    },
  ])

  /**
   * Get days from the database
   * @param params - The parameters for the query
   * @param params.from - The start date formatted as YYYY-MM-DD
   * @param params.to - The end date formatted as YYYY-MM-DD
   * @returns The tasks that match the query
   */
  async function getDays(params: {from?: ISODate; to?: ISODate} = {}): Promise<Day[]> {
    const {from, to} = params
    const fromDate = from ? from : DateTime.now().minus({years: 1}).toISODate()!
    const toDate = to ? to : DateTime.now().plus({years: 1}).toISODate()!

    return await db.transaction("readonly", ["tasks", "days", "tags"], async ([tasksStore, daysStore, tagsStore], done) => {
      const tasks = (await tasksStore.index("scheduled.date").getAll(IDBKeyRange.bound(fromDate, toDate))) ?? []
      const days = (await daysStore.index("date").getAll(IDBKeyRange.bound(fromDate, toDate))) ?? []
      const tags = (await tagsStore.getAll()) ?? []

      done()
      return groupTasksByDay({tasks, days, tags}) || []
    })
  }

  /**
   * Get a day from the database
   * @param date - The date formatted as YYYY-MM-DD of the day to get
   * @returns The day that matches the query
   */
  async function getDay(date: ISODate): Promise<Day | null> {
    return await db.transaction("readonly", ["days", "tasks", "tags"], async ([daysStore, tasksStore, tagsStore], done) => {
      const dayId = date.replaceAll("-", "")
      const dayItem = await daysStore.get(dayId)

      if (!dayItem) {
        done()
        return null
      }

      const fromDate = DateTime.fromISO(date).toISODate()!
      const toDate = DateTime.fromISO(date).toISODate()!

      const tasks = (await tasksStore.index("scheduled.date").getAll(IDBKeyRange.bound(fromDate, toDate))) ?? []
      const tags = (await tagsStore.getAll()) ?? []

      done()
      return groupTasksByDay({tasks, days: [dayItem], tags})[0] || null
    })
  }

  /**
   * Create a task in the database
   * @param content - The content of the task
   * @param params - The parameters for the task
   * @param params.date - The date formatted as YYYY-MM-DD of the day to create the task
   * @param params.time - The time formatted as HH:MM:SS of the task
   * @param params.timezone - The timezone of the task
   * @returns The day that matches the query
   */
  async function createTask(content: string, params: {date?: string; time?: string; timezone?: string}): Promise<Day> {
    const now = DateTime.now()
    const scheduledDate = params.date ? params.date : now.toISODate()!
    const scheduledTime = params.time ? params.time : now.toFormat("HH:mm")
    const scheduledTimezone = params.timezone ?? now.zoneName

    const newTask: Task = {
      id: nanoid(),
      content,
      status: "active",
      tags: [],
      createdAt: now.toISO()!,
      updatedAt: now.toISO()!,
      scheduled: {
        date: scheduledDate,
        time: scheduledTime,
        timezone: scheduledTimezone,
      },
    }

    const dayDate = scheduledDate
    const dayId = dayDate.replaceAll("-", "")

    await db.transaction("readwrite", ["tasks", "days"], async ([tasksStore, daysStore], done) => {
      await tasksStore.put(newTask)

      const existingDay = await daysStore.get(dayId)

      if (!existingDay) {
        const newDay: DayItem = {id: dayId, date: dayDate, subtitle: ""}
        await daysStore.put(newDay)
      }

      done()
    })

    const createdDay = await getDay(dayDate)
    if (!createdDay) throw new Error("Failed to create day after task creation")

    return createdDay
  }

  /**
   * Update a task in the database
   * @param id - The id of the task to update
   * @param updates - The updates to apply to the task
   * @returns The day that matches the query
   */
  async function updateTask(id: Task["id"], updates: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>): Promise<Day | null> {
    const taskDate = await db.transaction("readwrite", ["tasks", "days"], async ([tasksStore, daysStore], done) => {
      const task = await tasksStore.get(id)

      if (!task) {
        done()
        return null
      }

      const updatedTask = {
        ...task,
        ...updates,
        updatedAt: DateTime.now().toUTC().toISO(),
      }

      const taskDate = updatedTask.scheduled.date
      const dayId = taskDate.replaceAll("-", "")

      await tasksStore.put(updatedTask)

      if (!(await daysStore.get(dayId))) {
        const newDay: DayItem = {id: dayId, date: taskDate, subtitle: ""}
        await daysStore.put(newDay)
      }

      done()

      return taskDate
    })

    return taskDate ? getDay(taskDate) : null
  }

  /**
   * Delete a task in the database
   * @param id - The id of the task to delete
   * @returns The day that matches the query
   */
  async function deleteTask(id: Task["id"]): Promise<boolean> {
    return await db.transaction("readwrite", ["tasks"], async ([tasksStore], done) => {
      const task = await tasksStore.get(id)

      if (!task) {
        done()
        return false
      }

      try {
        await tasksStore.delete(id)

        done()
        return true
      } catch (error) {
        console.error("Error deleting task:", error)
        done(false)
        return false
      }
    })
  }

  async function addTaskTags(taskId: Task["id"], ids: Tag["id"][]): Promise<Task | null> {
    return await db.transaction("readwrite", ["tasks", "tags"], async ([tasksStore, tagsStore], done) => {
      const task: Task | null = await tasksStore.get(taskId)
      const allTags: Tag[] | null = await tagsStore.getAll()

      if (!task || !allTags) {
        done()
        return null
      }

      const newTags = ids.map((id) => allTags.find((tag) => tag.id === id)).filter(Boolean) as Tag[]
      const tags = arrayRemoveDuplicates(task.tags.concat(newTags), "id")

      const updatedTask = {...task, tags}

      await tasksStore.put(updatedTask)

      done()
      return updatedTask
    })
  }

  async function removeTaskTags(taskId: Task["id"], ids: Tag["id"][]): Promise<Task | null> {
    return await db.transaction("readwrite", ["tasks", "tags"], async ([tasksStore, tagsStore], done) => {
      const task: Task | null = await tasksStore.get(taskId)
      const allTags: Tag[] | null = await tagsStore.getAll()

      if (!task || !allTags) {
        done()
        return null
      }

      const newTags = task.tags.filter(({id}) => !ids.includes(id)) as Tag[]
      const tags = arrayRemoveDuplicates(newTags, "id")

      const updatedTask = {...task, tags}

      await tasksStore.put(updatedTask)

      done()
      return updatedTask
    })
  }

  /**
   * Update a day in the database
   * @param date - The date formatted as YYYY-MM-DD of the day to update
   * @param updates - The updates to apply to the day
   * @returns The day that matches the query
   */
  async function updateDay(date: string, updates: {subtitle?: string}): Promise<Day | null> {
    const id = date.replaceAll("-", "")

    await db.transaction("readwrite", ["days"], async ([daysStore], done) => {
      const day = await daysStore.get(id)

      const updatedDay: DayItem = {
        id,
        date,
        subtitle: updates.subtitle ?? day?.subtitle ?? "",
      }

      await daysStore.put(updatedDay)
      done()
    })

    return await getDay(date)
  }

  async function getTags(): Promise<Tag[]> {
    return await db.transaction("readonly", ["tags"], async ([tagsStore], done) => {
      const tags = await tagsStore.getAll()
      done()
      return tags
    })
  }

  async function createTag(name: Tag["name"], color: Tag["color"]): Promise<Tag | null> {
    return await db.transaction("readwrite", ["tags"], async ([tagsStore], done) => {
      const newTag: Tag = {
        id: nanoid(),
        name,
        color,
      }

      const existingTag = await tagsStore.index("name").get(name)

      if (existingTag) {
        done()
        return null
      }

      await tagsStore.put(newTag)
      done()

      return newTag
    })
  }

  async function deleteTag(id: Tag["id"]): Promise<boolean> {
    await db.transaction("readwrite", ["tags", "tasks"], async ([tagsStore, tasksStore], done) => {
      const tasks = (await tasksStore.getAll()) as Task[] | null

      if (!tasks) {
        done()
        return
      }

      for (const task of tasks) {
        const tags = task.tags.filter((tag) => tag.id !== id)
        await tasksStore.put({...task, tags})
      }

      await tagsStore.delete(id)
      done()
    })

    return true
  }

  return {
    createTask,
    updateTask,
    deleteTask,

    addTaskTags,
    removeTaskTags,

    getDays,
    getDay,
    updateDay,

    getTags,
    createTag,
    deleteTag,
  }
}

export const API = defineApi()

window.API = API
