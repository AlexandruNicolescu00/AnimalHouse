const login = async (req, res) => {
    res.send();
  };
  
  const dashboard = async (req, res) => {
    const luckyNumber = Math.floor(Math.random() * 100);
    res.status(200).json({ msg: `Numero fortunato: ${luckyNumber}` });
  };
  
  module.exports = {
    login,
    dashboard,
  };
  