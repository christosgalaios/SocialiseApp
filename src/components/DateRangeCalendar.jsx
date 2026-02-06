import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const DateRangeCalendar = ({ isOpen, onClose, dateRange, setDateRange, setThisWeekActive }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectingEnd, setSelectingEnd] = useState(false);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the 1st
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const formatMonthYear = (date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const isInRange = (day) => {
        if (!day || !dateRange.start) return false;
        if (!dateRange.end) return day.getTime() === dateRange.start.getTime();
        return day >= dateRange.start && day <= dateRange.end;
    };

    const isStart = (day) => {
        if (!day || !dateRange.start) return false;
        return day.toDateString() === dateRange.start.toDateString();
    };

    const isEnd = (day) => {
        if (!day || !dateRange.end) return false;
        return day.toDateString() === dateRange.end.toDateString();
    };

    const isPast = (day) => {
        if (!day) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return day < today;
    };

    const handleDayClick = (day) => {
        if (!day || isPast(day)) return;

        setThisWeekActive(false);

        if (!dateRange.start || (dateRange.start && dateRange.end)) {
            // Start fresh selection
            setDateRange({ start: day, end: null });
            setSelectingEnd(true);
        } else if (selectingEnd) {
            // Selecting end date
            if (day < dateRange.start) {
                // If clicked before start, make it new start
                setDateRange({ start: day, end: dateRange.start });
            } else {
                setDateRange({ ...dateRange, end: day });
            }
            setSelectingEnd(false);
        }
    };

    const navigateMonth = (direction) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const clearSelection = () => {
        setDateRange({ start: null, end: null });
        setSelectingEnd(false);
    };

    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-secondary border border-secondary/30 rounded-[32px] p-6 w-full max-w-sm shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black tracking-tight text-paper">Select Dates</h3>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-paper/10 flex items-center justify-center hover:bg-paper/20 transition-colors text-paper"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Selection Status */}
                    <div className="flex gap-3 mb-6">
                        <div className={`flex-1 p-3 rounded-xl border transition-all ${dateRange.start ? 'border-primary bg-primary/20' : 'border-paper/20 bg-paper/5'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest text-paper/50 block mb-1">From</span>
                            <span className="text-sm font-bold text-paper">
                                {dateRange.start ? dateRange.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                            </span>
                        </div>
                        <div className={`flex-1 p-3 rounded-xl border transition-all ${dateRange.end ? 'border-accent bg-accent/20' : 'border-paper/20 bg-paper/5'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest text-paper/50 block mb-1">To</span>
                            <span className="text-sm font-bold text-paper">
                                {dateRange.end ? dateRange.end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                            </span>
                        </div>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigateMonth(-1)}
                            className="w-10 h-10 rounded-full bg-paper/10 flex items-center justify-center hover:bg-paper/20 transition-colors text-paper"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-black uppercase tracking-widest text-paper">{formatMonthYear(currentMonth)}</span>
                        <button
                            onClick={() => navigateMonth(1)}
                            className="w-10 h-10 rounded-full bg-paper/10 flex items-center justify-center hover:bg-paper/20 transition-colors text-paper"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Week Days Header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-paper/50 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => {
                            const inRange = isInRange(day);
                            const isStartDay = isStart(day);
                            const isEndDay = isEnd(day);
                            const isDisabled = isPast(day);

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleDayClick(day)}
                                    disabled={!day || isDisabled}
                                    className={`
                    aspect-square rounded-xl text-sm font-bold transition-all relative
                    ${!day ? 'invisible' : ''}
                    ${isDisabled ? 'text-paper/20 cursor-not-allowed' : 'hover:bg-paper/10'}
                    ${inRange && !isStartDay && !isEndDay ? 'bg-primary/30 text-paper' : ''}
                    ${isStartDay ? 'bg-primary text-paper shadow-lg' : ''}
                    ${isEndDay ? 'bg-accent text-secondary shadow-lg' : ''}
                    ${!inRange && !isDisabled ? 'text-paper' : ''}
                  `}
                                >
                                    {day?.getDate()}
                                    {isStartDay && !isEndDay && dateRange.end && (
                                        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-primary/30 -z-10" />
                                    )}
                                    {isEndDay && dateRange.start && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-primary/30 -z-10" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Helper Text */}
                    <p className="text-center text-xs text-paper/50 mt-4 font-medium">
                        {!dateRange.start ? 'Tap to select start date' :
                            selectingEnd ? 'Tap to select end date' :
                                'Range selected'}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        {(dateRange.start || dateRange.end) && (
                            <button
                                onClick={clearSelection}
                                className="flex-1 py-3 rounded-xl text-sm font-bold bg-paper/10 hover:bg-paper/20 transition-colors text-paper"
                            >
                                Clear
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl text-sm font-bold bg-primary text-white shadow-lg active:scale-95 transition-transform"
                        >
                            Apply
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DateRangeCalendar;
