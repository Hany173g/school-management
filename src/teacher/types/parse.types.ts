type TeacherCsvRow = {
    name?: string
    email?: string
}

export type ParsedTeacherRecord = {
    record: TeacherCsvRow
    info: { lines: number }
}