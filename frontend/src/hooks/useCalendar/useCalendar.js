import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

export const useCalendar = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = useCallback(async (teamId = 'all') => {
        try {
            const teamQuery = teamId ? `?teamId=${teamId}` : '';
            const res = await fetch(`/api/events${teamQuery}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                // Parse dates properly
                const parsedEvents = data.map(evt => ({
                    ...evt,
                    start: new Date(evt.start),
                    end: new Date(evt.end)
                }));
                setEvents(parsedEvents);
            } else {
                toast.error('Failed to fetch events');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error loading calendar');
        } finally {
            setLoading(false);
        }
    }, [user.token]);

    const createEvent = async (eventData, teamId = null) => {
        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ ...eventData, teamId: teamId || eventData.teamId })
            });

            if (res.ok) {
                toast.success('Event created');
                // We don't refresh here, the page will refresh via socket or manual call
                return true;
            } else {
                toast.error('Failed to create event');
                return false;
            }
        } catch (error) {
            console.error(error);
            toast.error('Error creating event');
            return false;
        }
    };

    const updateEvent = async (id, eventData) => {
        try {
            const res = await fetch(`/api/events/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(eventData)
            });

            if (res.ok) {
                toast.success('Event updated');
                return true;
            } else {
                toast.error('Failed to update event');
                return false;
            }
        } catch (error) {
            console.error(error);
            toast.error('Error updating event');
            return false;
        }
    };

    const deleteEvent = async (id) => {
        try {
            const res = await fetch(`/api/events/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (res.ok) {
                toast.success('Event deleted');
                return true;
            } else {
                toast.error('Failed to delete event');
                return false;
            }
        } catch (error) {
            console.error(error);
            toast.error('Error deleting event');
            return false;
        }
    };

    // Initial load
    useEffect(() => {
        if (user) {
            fetchEvents();
        }
    }, [user, fetchEvents]);

    return {
        events,
        loading,
        fetchEvents,
        createEvent,
        updateEvent,
        deleteEvent
    };
};
