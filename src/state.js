export default {
  registrationProcesses: {
    filling: {
      valid: null,
      error: null,
      rssExists: null,
    },
    processing: {
      sending: null,
    },
    processed: {
      head: null,
      items: {},
    },
    failed: {
      error: null,
    },
  },
  rssUrls: [],
};
