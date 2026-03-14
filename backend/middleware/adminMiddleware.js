const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Не авторизовано' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Доступ заборонено. Потрібні права адміністратора.' 
    });
  }
  
  next();
};

module.exports = adminMiddleware;
