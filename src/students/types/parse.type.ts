type StudenCsvRow = {
    name?: string
    email?: string
    class_name : string
}

export type ParsedTeacherRecord = {
    record: StudenCsvRow
    info: { lines: number }
}