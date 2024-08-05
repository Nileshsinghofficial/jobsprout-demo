const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply for job route
router.post('/apply-job/:id', ensureAuthenticated, async (req, res) => {
    const jobId = req.params.id;
    const userId = req.session.user.id;

    try {
        // Check if the user has already applied for the job
        const checkApplicationSql = 'SELECT * FROM applications WHERE job_id = $1 AND user_id = $2';
        const checkResult = await db.query(checkApplicationSql, [jobId, userId]);

        if (checkResult.rows.length > 0) {
            return res.redirect('/profile?error_msg=You+have+already+applied+for+this+job.');
        }

        // Insert new application
        const sql = 'INSERT INTO applications (job_id, user_id) VALUES ($1, $2)';
        await db.query(sql, [jobId, userId]);

        res.redirect('/profile?success_msg=Successfully+applied+for+the+job.');
    } catch (err) {
        console.error('Error applying for job:', err);
        res.redirect('/profile?error_msg=An+error+occurred+while+applying+for+the+job.');
    }
});

// Profile page route
router.get('/profile', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id; // Get user ID from token

    try {
        const jobsSql = 'SELECT * FROM jobs';
        const jobsResult = await db.query(jobsSql);
        res.render('profile', { user: req.user, jobs: jobsResult.rows });
    } catch (err) {
        console.error('Error fetching jobs:', err);
        req.flash('error_msg', 'Error fetching jobs');
        res.redirect('/'); // Redirect to home or another appropriate page
    }
});

// View applied jobs
router.get('/applied-jobs', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id; // Get user ID from token

    try {
        const sql = `
            SELECT jobs.title, jobs.description 
            FROM applications 
            JOIN jobs ON applications.job_id = jobs.id 
            WHERE applications.user_id = $1
        `;
        const result = await db.query(sql, [userId]);
        res.render('applied-jobs', { jobs: result.rows });
    } catch (err) {
        console.error('Error fetching applied jobs:', err);
        req.flash('error_msg', 'Error fetching applied jobs');
        res.redirect('/profile');
    }
});


module.exports = router;
