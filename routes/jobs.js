const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply for job
router.post('/apply-job/:id', ensureAuthenticated, async (req, res) => {
    const jobId = req.params.id;
    const userId = req.session.user.id;

    try {
        // Check if the user has already applied for the job
        const checkApplicationSql = 'SELECT * FROM applications WHERE job_id = $1 AND user_id = $2';
        const checkResult = await db.query(checkApplicationSql, [jobId, userId]);

        if (checkResult.rows.length > 0) {
            req.flash('error_msg', 'You have already applied for this job.');
            return res.redirect('/profile');
        }

        // Insert new application
        const sql = 'INSERT INTO applications (job_id, user_id) VALUES ($1, $2)';
        await db.query(sql, [jobId, userId]);

        req.flash('success_msg', 'Successfully applied for the job.');
        res.redirect('/profile');
    } catch (err) {
        console.error('Error applying for job:', err);
        req.flash('error_msg', 'An error occurred while applying for the job.');
        res.redirect('/profile');
    }
});

// View applied jobs
router.get('/applied-jobs', ensureAuthenticated, async (req, res) => {
    const userId = req.session.user.id;

    try {
        const sql = `
            SELECT jobs.title, jobs.description, jobs.author
            FROM applications
            JOIN jobs ON applications.job_id = jobs.id
            WHERE applications.user_id = $1
        `;
        const result = await db.query(sql, [userId]);

        res.render('applied-jobs', { jobs: result.rows });
    } catch (err) {
        console.error('Error fetching applied jobs:', err);
        req.flash('error_msg', 'Error fetching applied jobs.');
        res.redirect('/profile');
    }
});

module.exports = router;
