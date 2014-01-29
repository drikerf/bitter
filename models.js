// Require
var mongoose = require('mongoose');

// New schema
var Schema = mongoose.Schema;

// Create schema
var pictureSchema = new Schema({
    // Mixed type
    picture: {type: {}, required: true}
});

// Create model
var Picture = mongoose.model('Picture', pictureSchema);

// Export model
exports.Picture = Picture;



