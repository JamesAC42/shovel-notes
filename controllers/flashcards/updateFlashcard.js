const { Flashcard, Deck } = require('../../models');
const getSession = require('../../utilities/getSession');
const userInRoom = require('../../utilities/userInRoom');

async function updateFlashcard(req, res, io) {
  try {
    const user = await getSession(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    let { flashcardId, front, back, is_starred, is_learned } = req.body;

    if(!flashcardId || !front || !back) {
      return res.status(400).json({ success: false, message: 'Flashcard ID, front, and back are required' });
    }

    front = front.slice(0, 300);
    back = back.slice(0, 300);
    //is_starred and is_learned must be boolean
    if(is_starred !== undefined) is_starred = Boolean(is_starred);
    if(is_learned !== undefined) is_learned = Boolean(is_learned);

    const flashcard = await Flashcard.findByPk(flashcardId);

    if (!flashcard) {
      return res.status(404).json({ success: false, message: 'Flashcard not found' });
    }

    const deck = await Deck.findByPk(flashcard.deck);
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Deck not found' });
    }

    const isUserInRoom = await userInRoom(user.id, deck.room);
    if (!isUserInRoom) {
      return res.status(403).json({ success: false, message: 'User not authorized to update this flashcard' });
    }

    if (front !== undefined) flashcard.front = front;
    if (back !== undefined) flashcard.back = back;
    if (is_starred !== undefined) flashcard.is_starred = is_starred;
    if (is_learned !== undefined) flashcard.is_learned = is_learned;

    deck.last_edited_at = new Date();
    deck.last_edited_by = user.id;
    
    await deck.save();
    await flashcard.save();

    // Emit socket event
    io.to(`room_${deck.room}`).emit('flashcardUpdated', { flashcard, deck, last_edited_by_username: user.username });

    res.status(200).json({ success: true, flashcard });
  } catch (error) {
    console.error('Error in updateFlashcard:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { updateFlashcard };