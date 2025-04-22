export type EventStatus = 
  | "created" // Создано
  | "searching" // Ищут людей
  | "found" // Нашли участников
  | "confirmed" // Согласовано
  | "in_progress" // Проводится
  | "completed" // Проведено
  | "canceled"; // Отменено