# PatchProof Sandbox Base Python Image
# Minimal, non-root, airgapped execution container
FROM python:3.12-slim

# Prepare workspace directory with write permissions for nobody (UID 65534)
RUN mkdir -p /workspace /tmp && \
    chown -R 65534:65534 /workspace /tmp && \
    chmod 777 /tmp /workspace

# Enforce unprivileged execution
USER 65534:65534
WORKDIR /workspace

CMD ["python3"]

