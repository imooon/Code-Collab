// This file handles CRUD operations for Reviews
import Review from '../models/review.js';
import User from '../models/user.js';

const reviewController = {};

// Function to add a new review
reviewController.addReview = async (req, res) => {
    try {
        const { userId, reviewedUserId, content, rating } = req.body;

        // Validate if the userId exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate if the reviewedUserId exists
        const reviewedUser = await User.findById(reviewedUserId);
        if (!reviewedUser) {
            return res.status(404).json({ message: 'Reviewed user not found' });
        }

 // Create a new review
 const newReview = new Review({ userId, reviewedUserId, content, rating });

 // Save the review to the database
 await newReview.save();

 // Populate the userId with username
 await newReview.populate('userId', 'username');

 res.json({ message: 'Review added successfully', review: newReview });
} catch (error) {
 console.error('Error adding review:', error);
 res.status(500).json({ message: 'Internal server error' });
}
};

// Function to get all reviews
reviewController.getAllReviews = async (req, res) => {
try {
 const reviews = await Review.find().populate('userId', 'username');
 res.status(200).json(reviews);
} catch (error) {
 console.error('Error retrieving reviews:', error);
 res.status(500).json({ message: 'Error retrieving reviews' });
}
};

// Function to get a single review by ID
reviewController.getReviewById = async (req, res) => {
try {
 const review = await Review.findById(req.params.id).populate('userId', 'username');
 if (!review) return res.status(404).json({ message: 'Review not found' });
 res.status(200).json(review);
} catch (error) {
 console.error('Error retrieving review:', error);
 res.status(500).json({ message: 'Error retrieving review' });
}
};

// Function to update a review by ID
reviewController.updateReview = async (req, res) => {
try {
 const review = await Review.findById(req.params.id);
 if (!review) {
     return res.status(404).json({ message: 'Review not found' });
 }
 // Check if the user making the request is the owner of the review
 if (review.userId.toString() !== req.body.userId) {
     return res.status(403).json({ message: 'You are not authorized to update this review' });
 }

 // Update the review
 review.content = req.body.content || review.content;
 review.rating = req.body.rating || review.rating;

 await review.save();
 await review.populate('userId', 'username');

 res.status(200).json({ message: 'Review updated successfully', review });
} catch (error) {
 console.error('Error updating review:', error);
 res.status(500).json({ message: 'Error updating review' });
}
};

// Function to delete a review by ID
reviewController.deleteReview = async (req, res) => {
try {
 const review = await Review.findById(req.params.id);
 if (!review) {
     return res.status(404).json({ message: 'Review not found' });
 }
 // Check if the user making the request is the owner of the review
 if (review.userId.toString() !== req.body.userId) {
     return res.status(403).json({ message: 'You are not authorized to delete this review' });
 }

 await review.remove();
 res.status(200).json({ message: 'Review deleted successfully' });
} catch (error) {
 console.error('Error deleting review:', error);
 res.status(500).json({ message: 'Error deleting review' });
}
};

// Function to get reviews by user ID
reviewController.getReviewsByUser = async (req, res) => {
try {
 const reviews = await Review.find({ userId: req.params.userId }).populate('userId', 'username');
 res.status(200).json(reviews);
} catch (error) {
 console.error('Error retrieving reviews:', error);
 res.status(500).json({ message: 'Error retrieving reviews' });
}
};

// Function to get reviews for a specific user ID
reviewController.getReviewsForUser = async (req, res) => {
try {
 const reviews = await Review.find({ reviewedUserId: req.params.userId }).populate('userId', 'username');
 res.status(200).json(reviews);
} catch (error) {
 console.error('Error retrieving reviews:', error);
 res.status(500).json({ message: 'Error retrieving reviews' });
}
};

export default reviewController;
