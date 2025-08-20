const express = require('express');
const Game = require('../models/Game');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { ethers } = require('ethers');

const router = express.Router();

// Create new game
router.post('/create', auth, async (req, res) => {
  try {
    const { gameType, maxPlayers, entryFee } = req.body;
    
    const game = new Game({
      creator: req.user.userId,
      gameType: gameType || 'battle-royale',
      maxPlayers: maxPlayers || 4,
      entryFee: entryFee || 0,
      status: 'waiting',
      players: [{
        userId: req.user.userId,
        walletAddress: req.user.walletAddress,
        joinedAt: new Date(),
        score: 0
      }]
    });

    await game.save();
    await game.populate('creator', 'username walletAddress level');

    res.json({ success: true, game });
  } catch (error) {
    console.error('Game creation error:', error);
    res.status(500).json({ error: 'Error creating game' });
  }
});

// Join existing game
router.post('/join/:gameId', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'waiting') {
      return res.status(400).json({ error: 'Game is not accepting new players' });
    }

    if (game.players.length >= game.maxPlayers) {
      return res.status(400).json({ error: 'Game is full' });
    }

    // Check if player already joined
    const alreadyJoined = game.players.some(p => p.userId.toString() === req.user.userId);
    if (alreadyJoined) {
      return res.status(400).json({ error: 'Already joined this game' });
    }

    game.players.push({
      userId: req.user.userId,
      walletAddress: req.user.walletAddress,
      joinedAt: new Date(),
      score: 0
    });

    // Start game if full
    if (game.players.length === game.maxPlayers) {
      game.status = 'active';
      game.startedAt = new Date();
    }

    await game.save();
    await game.populate('players.userId', 'username level avatar');

    res.json({ success: true, game });
  } catch (error) {
    console.error('Game join error:', error);
    res.status(500).json({ error: 'Error joining game' });
  }
});

// Get active games
router.get('/active', async (req, res) => {
  try {
    const games = await Game.find({ 
      status: { $in: ['waiting', 'active'] } 
    })
    .populate('creator', 'username level avatar')
    .populate('players.userId', 'username level avatar')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json({ success: true, games });
  } catch (error) {
    console.error('Fetch active games error:', error);
    res.status(500).json({ error: 'Error fetching games' });
  }
});

// Get game details
router.get('/:gameId', async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId)
      .populate('creator', 'username level avatar')
      .populate('players.userId', 'username level avatar');

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({ success: true, game });
  } catch (error) {
    console.error('Fetch game error:', error);
    res.status(500).json({ error: 'Error fetching game' });
  }
});

// Update game score
router.post('/:gameId/score', auth, async (req, res) => {
  try {
    const { score, action } = req.body;
    const game = await Game.findById(req.params.gameId);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'active') {
      return res.status(400).json({ error: 'Game is not active' });
    }

    const playerIndex = game.players.findIndex(p => p.userId.toString() === req.user.userId);
    if (playerIndex === -1) {
      return res.status(400).json({ error: 'Player not in this game' });
    }

    // Update player score
    game.players[playerIndex].score = score;
    game.players[playerIndex].lastAction = action;
    game.players[playerIndex].lastActionAt = new Date();

    await game.save();

    res.json({ success: true, message: 'Score updated' });
  } catch (error) {
    console.error('Score update error:', error);
    res.status(500).json({ error: 'Error updating score' });
  }
});

// End game
router.post('/:gameId/end', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Only creator or system can end game
    if (game.creator.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Only game creator can end the game' });
    }

    game.status = 'completed';
    game.endedAt = new Date();

    // Determine winner (highest score)
    const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
    if (sortedPlayers.length > 0) {
      game.winner = sortedPlayers[0].userId;
    }

    await game.save();

    // Update player statistics
    for (const player of game.players) {
      const user = await User.findById(player.userId);
      if (user) {
        user.gamesPlayed += 1;
        if (player.userId.toString() === game.winner?.toString()) {
          user.gamesWon += 1;
          user.experience += 100; // Winner bonus
        } else {
          user.experience += 25; // Participation bonus
        }
        
        // Level up logic
        const newLevel = Math.floor(user.experience / 1000) + 1;
        if (newLevel > user.level) {
          user.level = newLevel;
        }

        await user.save();
      }
    }

    await game.populate('winner', 'username walletAddress level');
    res.json({ success: true, game });
  } catch (error) {
    console.error('End game error:', error);
    res.status(500).json({ error: 'Error ending game' });
  }
});

// Get user's game history
router.get('/user/history', auth, async (req, res) => {
  try {
    const games = await Game.find({
      'players.userId': req.user.userId
    })
    .populate('creator', 'username level')
    .populate('winner', 'username level')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({ success: true, games });
  } catch (error) {
    console.error('Game history error:', error);
    res.status(500).json({ error: 'Error fetching game history' });
  }
});

module.exports = router;