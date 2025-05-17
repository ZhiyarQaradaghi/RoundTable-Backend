const Report = require("../models/Report");

class ReportService {
  async createReport(reportData) {
    const report = await Report.create(reportData);
    return report.populate(["reporter", "reportedUser", "discussion"]);
  }

  async getReports(filters = {}, page = 1, limit = 20) {
    const reports = await Report.find(filters)
      .populate("reporter", "username name")
      .populate("reportedUser", "username name")
      .populate("discussion", "title")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Report.countDocuments(filters);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateReportStatus(reportId, status, moderatorId) {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    report.status = status;
    await report.save();
    return report;
  }
}

module.exports = new ReportService();
