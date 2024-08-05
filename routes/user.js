const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { ensureAuthenticated } = require('../middleware/auth');

// Route to handle job applications
router.post('/apply-job/:id', ensureAuthenticated, async (req, res) => {
    const jobId = req.params.id;
    const userId = req.user.id;  

    try {
        const sql = 'INSERT INTO applications (job_id, user_id) VALUES ($1, $2)';
        await db.query(sql, [jobId, userId]);
        req.flash('success_msg', 'Job application submitted successfully');
        res.redirect('/profile'); // Redirect to profile
    } catch (err) {
        console.error('Error applying for job:', err);
        req.flash('error_msg', 'Error applying for job');
        res.redirect('/profile'); // Redirect to profile
    }
});

// Profile page route
router.get('/profile', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id;

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
    const userId = req.user.id;

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
