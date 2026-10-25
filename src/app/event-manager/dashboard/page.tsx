import { redirect } from 'next/navigation'
import { getEventManagerSession } from '@/lib/event-manager-session'
import { fetchAssignedEventsForManagerAction } from '@/app/actions/event-manager'
import { fetchApplicantsAction } from '@/app/actions/opportunities'
import EventManagerDashboard from '@/components/ui/EventManagerDashboard'

export default async function EventManagerDashboardPage() {
  const session = await getEventManagerSession()

  if (!session) {
    redirect('/event-manager/login')
  }

  const { activeEvents, pastEvents } = await fetchAssignedEventsForManagerAction(
    session.employeeId,
    session.phone
  )

  const dbApplicants = await fetchApplicantsAction()

  return (
    <EventManagerDashboard
      session={session}
      initialActiveEvents={activeEvents}
      initialPastEvents={pastEvents}
      initialApplicants={dbApplicants}
    />
  )
}
