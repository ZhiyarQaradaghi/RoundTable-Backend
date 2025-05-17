const reportService = require("../services/reportService");

class ReportController {
  async createReport(req, res) {
    try {
      const reportData = {
        ...req.body,
        reporter: req.user.id,
      };
      const report = await reportService.createReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getReports(req, res) {
    try {
      const { page, status } = req.query;
      const filters = {};

      if (status) {
        filters.status = status;
      }

      if (req.user.role !== "admin" && req.user.role !== "moderator") {
        filters.reporter = req.user.id;
      }

      const result = await reportService.getReports(filters, page);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateReportStatus(req, res) {
    try {
      if (req.user.role !== "admin" && req.user.role !== "moderator") {
        return res.status(403).json({ error: "Not authorized" });
      }

      const report = await reportService.updateReportStatus(
        req.params.id,
        req.body.status,
        req.user.id
      );
      res.json(report);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ReportController();
