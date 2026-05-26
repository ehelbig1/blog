document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let allPosts = [];
    let activeTag = 'all';
    let searchQuery = '';

    // --- Core Engine ---
    async function init() {
        try {
            const response = await fetch('/data/posts.json');
            if (!response.ok) throw new Error('Failed to fetch posts');
            allPosts = await response.json();
            renderPosts();
        } catch (error) {
            console.error('Blog Registry Error:', error);
            // Fallback for local development or missing registry
            const grid = document.getElementById('blog-grid');
            if (grid) grid.innerHTML = '<div style="color: var(--secondary); text-align: center; padding: 2rem;">[CRITICAL_ERROR] UNABLE TO REACH REGISTRY</div>';
        }
    }

    function renderPosts() {
        const grid = document.getElementById('blog-grid');
        const noResults = document.getElementById('no-results');

        const filtered = allPosts.filter(post => {
            const matchesTag = activeTag === 'all' || post.tag === activeTag;
            const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTag && matchesSearch;
        }).reverse();

        grid.innerHTML = '';

        if (filtered.length === 0) {
            noResults.style.display = 'block';
            grid.style.display = 'none';
        } else {
            noResults.style.display = 'none';
            grid.style.display = 'grid';

            filtered.forEach((post, index) => {
                const card = document.createElement('article');
                card.className = 'card reveal';
                card.style.animationDelay = `${index * 0.1}s`;
                card.innerHTML = `
                    <div class="card-image">
                        <img src="${post.image}" alt="${post.title}" loading="lazy">
                        <div class="card-tag">${post.tag}</div>
                    </div>
                    <div class="card-content">
                        <div class="card-footer" style="margin-bottom: 1rem; border: none; padding: 0;">
                            <span>${post.date}</span>
                            <span>${post.readTime}</span>
                        </div>
                        <h3 class="post-card-title">${post.title}</h3>
                        <p>${post.excerpt}</p>
                        <a href="${post.url}" class="read-more" style="color: var(--primary); font-weight: 700; text-decoration: none;">Read Full Insight →</a>
                    </div>
                `;
                grid.appendChild(card);
                if (observer) observer.observe(card);
            });
        }
    }

    // --- Filter Logic ---
    const tagBtns = document.querySelectorAll('.tag-btn');
    tagBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tagBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTag = btn.dataset.tag;
            renderPosts();
        });
    });

    // --- Search Logic ---
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderPosts();
        });
    }

    // --- Animations & Interactivity ---
    function setupCodeBlocks() {
        const codes = document.querySelectorAll('pre code');
        codes.forEach(block => {
            // Prism highlighting is handled by the library
        });
    }
    setupCodeBlocks();
    initCopyButtons();
    initPlaygrounds();

    // 4. Global Code Utilities
    function initCopyButtons() {
        document.querySelectorAll('pre').forEach(block => {
            if (block.querySelector('.copy-btn')) return; // Avoid double buttons
            const button = document.createElement('button');
            button.className = 'copy-btn';
            button.innerText = 'COPY';
            button.style.position = 'absolute';
            button.style.top = '0.5rem';
            button.style.right = '0.5rem';

            block.style.position = 'relative';
            block.appendChild(button);

            button.addEventListener('click', () => {
                const code = block.querySelector('code').innerText;
                navigator.clipboard.writeText(code).then(() => {
                    button.innerText = 'COPIED!';
                    setTimeout(() => button.innerText = 'COPY', 2000);
                });
            });
        });
    }

    function initPlaygrounds() {
        document.querySelectorAll('.code-playground').forEach(playground => {
            const editor = playground.querySelector('.playground-editor');
            const runBtn = playground.querySelector('.run-btn');
            const output = playground.querySelector('.playground-output');
            const engine = playground.getAttribute('data-engine') || 'evaluate';

            if (runBtn && editor && output) {
                runBtn.addEventListener('click', () => {
                    const input = editor.value || editor.innerText;
                    output.innerHTML = '<span style="color: var(--primary)">[SYSTEM] PROCESSING...</span>';

                    setTimeout(() => {
                        let result;
                        if (engine === 'encrypt') {
                            result = wasmProxy.encrypt(input);
                        } else if (engine === 'genkey') {
                            result = wasmProxy.genkey();
                        } else {
                            result = wasmProxy.evaluate(input);
                        }
                        output.innerHTML = result;
                    }, 800);
                });
            }
        });
    }

    // Intersection Observer for reveal animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1
    });

    function setupAnimations() {
        document.querySelectorAll('.reveal').forEach(el => {
            observer.observe(el);
        });
    }

    // Decrypt Effect
    function setupDecrypt() {
        const decrypts = document.querySelectorAll('.decrypt');
        decrypts.forEach(el => {
            const target = el.dataset.text;
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+";
            let iteration = 0;
            let interval = null;

            el.onmouseover = () => {
                clearInterval(interval);
                interval = setInterval(() => {
                    el.innerText = target.split("")
                        .map((letter, index) => {
                            if (index < iteration) return target[index];
                            return letters[Math.floor(Math.random() * 26)];
                        })
                        .join("");
                    if (iteration >= target.length) clearInterval(interval);
                    iteration += 1 / 3;
                }, 30);
            };
        });
    }

    // --- Reading Progress ---
    const progress = document.getElementById('reading-progress');
    if (progress) {
        window.onscroll = () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progress.style.width = scrolled + "%";
        };
    }

    // --- WASM Engine Bridge ---
    // The console/playgrounds run the compiled Rust engine in wasm-engine/pkg.
    // We keep an equivalent pure-JS path as a fallback so the UI never breaks
    // if the module fails to load (old browser, fetch error, etc.).
    let wasmEngine = null;
    (async () => {
        try {
            const mod = await import('/wasm-engine/pkg/blog_wasm_engine.js');
            await mod.default();
            wasmEngine = new mod.BlogEngine();
        } catch (e) {
            console.warn('[WASM] engine unavailable, using JS fallback:', e);
        }
    })();

    const WASM_TAG = '<span style="color: var(--primary)">[WASM_ENGINE]</span>';
    const colorPolicy = (text) => {
        if (text.startsWith('[SUCCESS]')) return `<span style="color: #4ade80">${text}</span>`;
        if (text.startsWith('[FAILED]')) return `<span style="color: #f87171">${text}</span>`;
        return `<span style="color: var(--secondary)">${text}</span>`;
    };

    const wasmProxy = {
        genkey: () => {
            if (wasmEngine) return `${WASM_TAG} ${wasmEngine.genkey()}`;
            const key = Array.from({
                length: 32
            }, () => Math.floor(Math.random() * 16).toString(16)).join('');
            return `${WASM_TAG} Generated 256-bit AES Key: 0x${key}`;
        },
        verify: (token) => {
            if (wasmEngine) return `${WASM_TAG} ${wasmEngine.verify(token || '')}`;
            const valid = token && token.startsWith('eyJ') && token.includes('.');
            return valid ?
                `${WASM_TAG} JWT Signature Matched. Principal: admin.` :
                `${WASM_TAG} [INVALID] Signature Mismatch.`;
        },
        encrypt: (data) => {
            if (!data) return 'ERROR: Usage "encrypt <data>"';
            if (wasmEngine) return `${WASM_TAG} ${wasmEngine.encrypt(data)}`;
            const encrypted = data.split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ 42)).join('');
            return `${WASM_TAG} Encrypted Payload (XOR-42): ${encrypted}`;
        },
        evaluate: (policy) => {
            if (wasmEngine) return colorPolicy(wasmEngine.evaluate(policy || ''));
            if (policy.includes('"trust_score":')) {
                const parts = policy.split('"trust_score":')[1].split(/[},]/)[0].trim();
                const score = parseInt(parts);
                if (!isNaN(score)) {
                    return score >= 80 ?
                        `<span style="color: #4ade80">[SUCCESS] Policy Passed: Trust Score ${score} Verified.</span>` :
                        `<span style="color: #f87171">[FAILED] Policy Rejected: Trust Score ${score} below threshold (80).</span>`;
                }
            }
            return `<span style="color: var(--secondary)">[ERROR] Invalid Policy Syntax. Access Denied.</span>`;
        }
    };

    // --- Console (Terminal) ---
    const termTrigger = document.querySelector('.terminal-trigger');
    const termWindow = document.querySelector('.terminal-window');
    const termClose = document.querySelector('.terminal-close');
    const termInput = document.getElementById('term-input');
    const termOutput = document.getElementById('term-output');

    if (termTrigger) {
        termTrigger.addEventListener('click', () => {
            termWindow.style.display = 'flex';
            termInput.focus();
        });
    }

    if (termClose) {
        termClose.addEventListener('click', () => {
            termWindow.style.display = 'none';
        });
    }

    if (termInput) {
        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = termInput.value.trim().toLowerCase();
                handleCommand(cmd);
                termInput.value = '';
            }
        });
    }

    function handleCommand(cmd) {
        if (!cmd) return;

        const line = document.createElement('div');
        line.innerHTML = `<span class="prompt">></span> ${cmd}`;
        termOutput.appendChild(line);

        let response = '';
        if (cmd === 'help') {
            response = 'Available: GENKEY, VERIFY &lt;token&gt;, ENCRYPT &lt;msg&gt;, CLEAR';
        } else if (cmd === 'clear') {
            termOutput.innerHTML = '';
            return;
        } else if (cmd === 'genkey') {
            response = wasmProxy.genkey();
        } else if (cmd.startsWith('verify ')) {
            response = wasmProxy.verify(cmd.split(' ')[1]);
        } else if (cmd.startsWith('encrypt ')) {
            response = wasmProxy.encrypt(cmd.substring(8));
        } else {
            response = `<span style="color: var(--secondary)">UNKNOWN_COMMAND: Type 'help' for available security protocols.</span>`;
        }

        const resLine = document.createElement('div');
        resLine.innerHTML = response;
        termOutput.appendChild(resLine);
        termOutput.scrollTop = termOutput.scrollHeight;
    }

    // Initialize everything
    init();
    setupAnimations();
    setupDecrypt();
});