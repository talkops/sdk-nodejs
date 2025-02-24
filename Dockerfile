FROM node:20-slim
ENV NODE_NO_WARNINGS=1
USER node
WORKDIR /app
CMD ["sleep", "infinity" ]
