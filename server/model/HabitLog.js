const mongoose = require("mongoose");

const HabitLogSchema = new mongoose.Schema({

habitId: String,

date: String,

completed: Boolean,

timeSpent: {
    type: Number,
    default: 0
},

note: String

});

module.exports = mongoose.model("HabitLog", HabitLogSchema);
