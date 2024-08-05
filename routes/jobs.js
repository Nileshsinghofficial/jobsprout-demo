const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply for job
router.post('/apply-job/:id', (req, res) => {
    if (!req.session.user) {
        req.flash('error_msg', 'Please login to apply for jobs.');
        return res.redirect('/login');
    }
    const jobId = req.params.id;
    const userId = req.session.user.id;

    const sql = 'INSERT INTO applications (job_id, user_id) VALUES (?, ?)';
    db.query(sql, [jobId, userId], (err, result) => {
        if (err) {
            req.flash('error_msg', 'Already applying this job');
            return res.redirect('/profile');
        }
        req.flash('success_msg', 'Successfully applied for job');
        res.redirect('/profile');
    });
});
router.get('/applied-jobs', ensureAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const sql = `
        SELECT jobs.title, jobs.description , jobs.author
        FROM applications 
        JOIN jobs ON applications.job_id = jobs.id 
        WHERE applications.user_id = ?
    `;
    db.query(sql, [userId], (err, results) => {
        if (err) {
            req.flash('error_msg', 'Error fetching applied jobs');
            return res.redirect('/profile');
        }
        res.render('applied-jobs', { jobs: results });
    });
});

 

module.exports = router;
