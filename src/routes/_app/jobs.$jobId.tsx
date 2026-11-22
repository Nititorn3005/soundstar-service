function CallLogDialog({
  job,
  open,
  onOpenChange,
}: {
  job: RepairJob
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { updateJob, currentUser } = useAppStore()
  const [callNote, setCallNote] = React.useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>บันทึกการโทรติดตามลูกค้า</DialogTitle>
          <DialogDescription>
            โทรหา <span className="font-semibold text-foreground">{job.customerName}</span> ({job.phone}) — บันทึกประวัติลงไทม์ไลน์ใบงาน <JobNo>{job.jobNo}</JobNo>
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            const trimmed = callNote.trim()
            if (!trimmed) return toast.error('กรุณาระบุรายละเอียดผลการโทรติดต่อ')
            const newEntry = {
              id: `call-${Date.now()}`,
              from: job.status,
              to: job.status,
              at: new Date().toISOString(),
              by: currentUser?.id || job.receivedBy,
              note: `📞 ${trimmed}`,
            }
            const nextHistory = [...(Array.isArray(job.history) ? job.history : []), newEntry]
            const res = await updateJob(job.id, { history: nextHistory })
            if (!res.ok) return toast.error(res.error)
            toast.success('บันทึกประวัติการโทรเรียบร้อยแล้ว')
            setCallNote('')
            onOpenChange(false)
          }}
        >
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">เลือกข้อความด่วน:</p>
            <div className="flex flex-wrap gap-1.5">
              {CALL_LOG_TEMPLATES.map((tpl) => (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => setCallNote(tpl)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[11px] transition-colors',
                    callNote === tpl
                      ? 'border-blue-500 bg-blue-50 font-semibold text-blue-900'
                      : 'border-border bg-muted/50 text-foreground hover:bg-muted',
                  )}
                >
                  {tpl}
                </button>
              ))}
            </div>
          </div>
          <Field label="รายละเอียดผลการโทร / ข้อตกลงกับลูกค้า" htmlFor="call-log-note" required>
            <Textarea
              id="call-log-note"
              rows={3}
              placeholder="เช่น โทรแจ้งค่าอะไหล่ 1,250 บาท ลูกค้าตกลงซ่อม นัดเข้าวันศุกร์ 10:00 น."
              value={callNote}
              onChange={(e) => setCallNote(e.target.value)}
              required
            />
          </Field>
          <DialogFooter>
            <Button type="submit" size="lg">
              <PhoneCall className="mr-1.5 size-4" /> บันทึกประวัติการโทร
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
