# RAG2 - OpenAI Vector Store RAG System

.PHONY: help
help:
	@echo "RAG2 Commands:"
	@echo "  make install     - Install dependencies"
	@echo "  make setup       - Create .env file"
	@echo "  make upload      - Upload knowledge base"
	@echo "  make upload-new  - Create new vector store and upload"
	@echo "  make search      - Search (use: make search QUERY=\"your question\")"
	@echo "  make wipe        - Clear vector store"
	@echo "  make test        - Run tests"
	@echo "  make status      - Show status"

.PHONY: install
install:
	npm install

.PHONY: setup
setup:
	cp .env.example .env
	@echo "Edit .env with your OpenAI API key"

.PHONY: upload
upload:
	node --max-old-space-size=8192 node_modules/.bin/tsx src/upload.ts

.PHONY: upload-new
upload-new:
	node --max-old-space-size=8192 node_modules/.bin/tsx src/upload.ts --create-new

.PHONY: search
search:
	npm run search "$(QUERY)"

.PHONY: wipe
wipe:
	npm run wipe

.PHONY: test
test:
	npm run test

.PHONY: status
status:
	@echo "RAG2 Status:"
	@[ -f .env ] && echo "✅ .env exists" || echo "❌ .env missing"
	@[ -d node_modules ] && echo "✅ Dependencies installed" || echo "❌ Run 'make install'"
	@[ -d ../demo-data/knowledge-base ] && echo "✅ Knowledge base found" || echo "❌ Knowledge base missing"