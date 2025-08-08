class IndexController {
    getIndex(req, res) {
        res.send('Welcome to the Random Maker API!');
    }
}

module.exports = IndexController;