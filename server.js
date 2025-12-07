require("dotenv").config();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/categoria", require("./routes/categoria"));
app.use("/api/validacionReportes", require("./routes/validacionReportes"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/MisReportes", require("./routes/MisReportes"));
app.use("/api/usuario", require("./routes/usuario"));
app.use("/api/reporte", require("./routes/reporte"));

// Servir página de prueba de login
app.get("/test-login", (req, res) => {
  res.sendFile(path.join(__dirname, "../FRONTEND/public/test-login.html"));
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend en http://localhost:${PORT}`);
});

// Exportar para Vercel (serverless)
module.exports = app;
