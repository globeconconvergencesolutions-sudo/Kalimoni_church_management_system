-- Refresh welcome notice copy (removes internal setup language from early seed data)
update public.notices
set body = 'Sunday Mass at 7:30 AM and 9:30 AM. Join us in Kalimoni, Juja — all are welcome in Christ.'
where body ilike '%edited from the parish office%';
