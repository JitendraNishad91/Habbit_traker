const mongoose = require("mongoose");

const HabitSchema = new mongoose.Schema({

    userId: String,

    title: String,

    category: String,

    createdAt: {
        type: Date,
        default: Date.now
    },

    completedDates: [{
        type: Date,
        default: []
    }]

});

module.exports = mongoose.model("Habit",HabitSchema);