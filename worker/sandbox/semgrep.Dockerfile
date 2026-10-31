# PatchProof Sandboxed Semgrep Scanner Image
# Self-contained, airgapped static analysis container with bundled rules
FROM python:3.12-slim

RUN pip install --no-cache-dir semgrep==1.99.0

# Prepare workspace and rules directories
RUN mkdir -p /workspace /rules /tmp && \
    chown -R 65534:65534 /workspace /rules /tmp && \
    chmod 777 /workspace /rules /tmp

COPY rules/ /rules/

USER 65534:65534
WORKDIR /workspace

ENTRYPOINT ["semgrep"]
CMD ["--config=/rules", "--json", "/workspace"]

