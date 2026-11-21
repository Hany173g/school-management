


export type CsvRow = {
    name?: string
    capacity?: string
    teacher_name?: string
    teacher_email?: string
}

export type ParsedRecord = {
    record: CsvRow
    info: { lines: number }
}