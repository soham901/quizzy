import { Capacitor } from "@capacitor/core";

const MCQApp = {
  async showToast(message) {
    try {
      if (Capacitor.isPluginAvailable("Toast")) {
        const { Toast } = await import("@capacitor/toast");
        return Toast.show({ text: message });
      } else {
        // Fallback for web
        console.log("Toast:", message);
        return Promise.resolve();
      }
    } catch (error) {
      // Fallback if import fails
      console.log("Toast:", message);
      return Promise.resolve();
    }
  },

  async shareQuestion(question) {
    try {
      if (Capacitor.isPluginAvailable("Share")) {
        const { Share } = await import("@capacitor/share");
        return Share.share({
          title: "MCQ Question",
          text: question.question,
          dialogTitle: "Share Question",
        });
      } else {
        // Fallback for web
        console.log("Share:", question);
        return Promise.resolve();
      }
    } catch (error) {
      // Fallback if import fails
      console.log("Share:", question);
      return Promise.resolve();
    }
  },
};

export default MCQApp;
