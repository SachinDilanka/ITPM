import { useState, useEffect, useCallback, useRef } from 'react';
import useAuth from './useAuth';
import { getRatingSummariesApi, upsertRatingApi, deleteRatingApi } from '../api/ratingsApi';
import { getUserMongoId } from '../utils/helpers';

/**
 * Loads per-note rating summaries and handles star rating / unrate (browse + dashboard lists).
 */
export function useNoteRatings(notes) {
    const { user } = useAuth();
    const [ratingsByNoteId, setRatingsByNoteId] = useState({});
    const [ratingLoadingNoteId, setRatingLoadingNoteId] = useState(null);
    const ratingsRef = useRef(ratingsByNoteId);
    ratingsRef.current = ratingsByNoteId;

    useEffect(() => {
        if (!getUserMongoId(user) || !notes?.length) {
            setRatingsByNoteId({});
            return;
        }

        let cancelled = false;
        getRatingSummariesApi(notes.map((n) => n._id))
            .then((res) => {
                if (cancelled) return;
                const map = (res.data?.data || []).reduce((acc, row) => {
                    acc[String(row.noteId)] = row;
                    return acc;
                }, {});
                setRatingsByNoteId(map);
            })
            .catch(() => {
                if (!cancelled) setRatingsByNoteId({});
            });

        return () => {
            cancelled = true;
        };
    }, [notes, user]);

    const handleRateNote = useCallback(async (noteId, rating) => {
        setRatingLoadingNoteId(noteId);
        try {
            if (rating === 0) {
                const row = ratingsRef.current[noteId];
                const ratingId = row?.ratingId;
                if (row?.userRating && ratingId) {
                    const res = await deleteRatingApi(ratingId);
                    const body = res?.data ?? {};
                    const summary = body.summary ?? body.data?.summary;
                    if (summary) {
                        setRatingsByNoteId((prev) => ({
                            ...prev,
                            [String(summary.noteId ?? noteId)]: summary,
                        }));
                    } else {
                        const refetch = await getRatingSummariesApi([String(noteId)]);
                        const rowData = (refetch.data?.data || []).find(
                            (r) => String(r.noteId) === String(noteId)
                        );
                        if (rowData) {
                            setRatingsByNoteId((prev) => ({
                                ...prev,
                                [String(noteId)]: rowData,
                            }));
                        }
                    }
                } else {
                    setRatingsByNoteId((prev) => ({
                        ...prev,
                        [noteId]: {
                            ...(prev[noteId] || {}),
                            userRating: null,
                        },
                    }));
                }
            } else {
                const res = await upsertRatingApi({
                    noteId: String(noteId),
                    rating: Number(rating),
                });
                const body = res?.data ?? {};
                const summary = body.summary ?? body.data?.summary;
                if (summary) {
                    setRatingsByNoteId((prev) => ({
                        ...prev,
                        [String(summary.noteId ?? noteId)]: summary,
                    }));
                } else {
                    const refetch = await getRatingSummariesApi([String(noteId)]);
                    const rowData = (refetch.data?.data || []).find(
                        (r) => String(r.noteId) === String(noteId)
                    );
                    if (rowData) {
                        setRatingsByNoteId((prev) => ({
                            ...prev,
                            [String(noteId)]: rowData,
                        }));
                    }
                }
            }
        } catch (err) {
            console.error('Rating request failed:', err.response?.data || err.message);
        } finally {
            setRatingLoadingNoteId(null);
        }
    }, []);

    return {
        ratingsByNoteId,
        handleRateNote,
        ratingLoadingNoteId,
    };
}
