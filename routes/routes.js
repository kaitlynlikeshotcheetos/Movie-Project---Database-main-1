import express from 'express';
import * as mainController from '../controllers/mainController.js';

const router = express.Router();

router.get('/', mainController.showMovies);
router.post('/search', mainController.searchMovies);
router.post('/save', mainController.saveMovie);
router.get('/watch/:id', mainController.watchMovie);
router.get('/delete/:id', mainController.deleteMovie);
router.post('/sort', mainController.sortMovies);
router.get('/results', (req, res) => res.render('results'));
router.get('/rank', mainController.showTier);
//router.post('/save-tier-movies', mainController.saveTierMovies);
//router.get('/get-tier-movies', mainController.getTierMovies);

export default router;
