--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: email_agent
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO email_agent;

--
-- Name: agent_action; Type: TYPE; Schema: public; Owner: email_agent
--

CREATE TYPE public.agent_action AS ENUM (
    'email_read',
    'email_forwarded',
    'draft_created',
    'draft_edited',
    'draft_approved',
    'draft_rejected',
    'draft_sent',
    'thread_assigned',
    'thread_status_changed',
    'thread_archived'
);


ALTER TYPE public.agent_action OWNER TO email_agent;

--
-- Name: direction; Type: TYPE; Schema: public; Owner: email_agent
--

CREATE TYPE public.direction AS ENUM (
    'inbound',
    'outbound'
);


ALTER TYPE public.direction OWNER TO email_agent;

--
-- Name: draft_status; Type: TYPE; Schema: public; Owner: email_agent
--

CREATE TYPE public.draft_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'sent'
);


ALTER TYPE public.draft_status OWNER TO email_agent;

--
-- Name: role; Type: TYPE; Schema: public; Owner: email_agent
--

CREATE TYPE public.role AS ENUM (
    'agent',
    'manager',
    'admin'
);


ALTER TYPE public.role OWNER TO email_agent;

--
-- Name: status; Type: TYPE; Schema: public; Owner: email_agent
--

CREATE TYPE public.status AS ENUM (
    'active',
    'closed',
    'needs_attention'
);


ALTER TYPE public.status OWNER TO email_agent;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: email_agent
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO email_agent;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: email_agent
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO email_agent;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: email_agent
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: agent_actions; Type: TABLE; Schema: public; Owner: email_agent
--

CREATE TABLE public.agent_actions (
    id integer NOT NULL,
    thread_id integer NOT NULL,
    email_id integer,
    draft_response_id integer,
    actor_user_id integer,
    action character varying(100) NOT NULL,
    metadata jsonb,
    ip_address character varying(45),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    description text
);


ALTER TABLE public.agent_actions OWNER TO email_agent;

--
-- Name: agent_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: email_agent
--

CREATE SEQUENCE public.agent_actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.agent_actions_id_seq OWNER TO email_agent;

--
-- Name: agent_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: email_agent
--

ALTER SEQUENCE public.agent_actions_id_seq OWNED BY public.agent_actions.id;


--
-- Name: draft_responses; Type: TABLE; Schema: public; Owner: email_agent
--

CREATE TABLE public.draft_responses (
    id integer NOT NULL,
    email_id integer NOT NULL,
    thread_id integer NOT NULL,
    generated_content text NOT NULL,
    status public.draft_status DEFAULT 'pending'::public.draft_status NOT NULL,
    created_by_user_id integer,
    version integer DEFAULT 1 NOT NULL,
    parent_draft_id integer,
    confidence_score numeric(4,3),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    citations jsonb
);


ALTER TABLE public.draft_responses OWNER TO email_agent;

--
-- Name: draft_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: email_agent
--

CREATE SEQUENCE public.draft_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.draft_responses_id_seq OWNER TO email_agent;

--
-- Name: draft_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: email_agent
--

ALTER SEQUENCE public.draft_responses_id_seq OWNED BY public.draft_responses.id;


--
-- Name: email_tags; Type: TABLE; Schema: public; Owner: email_agent
--

CREATE TABLE public.email_tags (
    id integer NOT NULL,
    email_id integer NOT NULL,
    tag character varying(50) NOT NULL,
    confidence numeric(4,3),
    created_by_user_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.email_tags OWNER TO email_agent;

--
-- Name: email_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: email_agent
--

CREATE SEQUENCE public.email_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_tags_id_seq OWNER TO email_agent;

--
-- Name: email_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: email_agent
--

ALTER SEQUENCE public.email_tags_id_seq OWNED BY public.email_tags.id;


--
-- Name: emails; Type: TABLE; Schema: public; Owner: email_agent
--

CREATE TABLE public.emails (
    id integer NOT NULL,
    thread_id integer NOT NULL,
    from_email character varying(255) NOT NULL,
    to_emails jsonb NOT NULL,
    cc_emails jsonb,
    bcc_emails jsonb,
    subject character varying(500) NOT NULL,
    body_text text,
    body_html text,
    direction public.direction NOT NULL,
    is_draft boolean DEFAULT false NOT NULL,
    sent_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.emails OWNER TO email_agent;

--
-- Name: emails_id_seq; Type: SEQUENCE; Schema: public; Owner: email_agent
--

CREATE SEQUENCE public.emails_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.emails_id_seq OWNER TO email_agent;

--
-- Name: emails_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: email_agent
--

ALTER SEQUENCE public.emails_id_seq OWNED BY public.emails.id;


--
-- Name: threads; Type: TABLE; Schema: public; Owner: email_agent
--

CREATE TABLE public.threads (
    id integer NOT NULL,
    subject character varying(500) NOT NULL,
    participant_emails jsonb NOT NULL,
    status public.status DEFAULT 'active'::public.status NOT NULL,
    last_activity_at timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.threads OWNER TO email_agent;

--
-- Name: threads_id_seq; Type: SEQUENCE; Schema: public; Owner: email_agent
--

CREATE SEQUENCE public.threads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.threads_id_seq OWNER TO email_agent;

--
-- Name: threads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: email_agent
--

ALTER SEQUENCE public.threads_id_seq OWNED BY public.threads.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: email_agent
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    role public.role DEFAULT 'agent'::public.role NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    stack_auth_id text,
    password_hash text,
    last_login_at timestamp without time zone,
    refresh_token_revoked_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO email_agent;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: email_agent
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO email_agent;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: email_agent
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: email_agent
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: agent_actions id; Type: DEFAULT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.agent_actions ALTER COLUMN id SET DEFAULT nextval('public.agent_actions_id_seq'::regclass);


--
-- Name: draft_responses id; Type: DEFAULT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.draft_responses ALTER COLUMN id SET DEFAULT nextval('public.draft_responses_id_seq'::regclass);


--
-- Name: email_tags id; Type: DEFAULT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.email_tags ALTER COLUMN id SET DEFAULT nextval('public.email_tags_id_seq'::regclass);


--
-- Name: emails id; Type: DEFAULT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.emails ALTER COLUMN id SET DEFAULT nextval('public.emails_id_seq'::regclass);


--
-- Name: threads id; Type: DEFAULT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.threads ALTER COLUMN id SET DEFAULT nextval('public.threads_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: email_agent
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	fa9b9475bde333a7fbfb40b2ea5c8e1a022d12f22819ee49b7c2500699a09361	1752011365254
2	3d46f007b159210558adc9af3b489429e26f7504324d13eda5bbc6190d188af2	1752012451077
3	3f9f683e61b97130957b150469e4586a79034c1fea50ee3404f3de7923548b93	1752013708183
4	a621d7ccf9b290ce72044c37b3346ebff57d25b7116738d8a6ed790c374da0e3	1752014326344
5	b8a9d5f3db1030323ddfd89652a053464ae061accb841eaeb66bbe3c65706e07	1752088632894
6	84880df295e610e0440c93ae314de312430e7a3bfea7b90da8c4df8c60584a48	1752188570641
7	eb0707f77ffaa2995370debe6a7be556fca0cc0f102e2263fadd7d79346ef5f7	1752255403549
\.


--
-- Data for Name: agent_actions; Type: TABLE DATA; Schema: public; Owner: email_agent
--

COPY public.agent_actions (id, thread_id, email_id, draft_response_id, actor_user_id, action, metadata, ip_address, created_at, description) FROM stdin;
\.


--
-- Data for Name: draft_responses; Type: TABLE DATA; Schema: public; Owner: email_agent
--

COPY public.draft_responses (id, email_id, thread_id, generated_content, status, created_by_user_id, version, parent_draft_id, confidence_score, created_at, updated_at, citations) FROM stdin;
\.


--
-- Data for Name: email_tags; Type: TABLE DATA; Schema: public; Owner: email_agent
--

COPY public.email_tags (id, email_id, tag, confidence, created_by_user_id, created_at) FROM stdin;
\.


--
-- Data for Name: emails; Type: TABLE DATA; Schema: public; Owner: email_agent
--

COPY public.emails (id, thread_id, from_email, to_emails, cc_emails, bcc_emails, subject, body_text, body_html, direction, is_draft, sent_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: threads; Type: TABLE DATA; Schema: public; Owner: email_agent
--

COPY public.threads (id, subject, participant_emails, status, last_activity_at, created_at, updated_at) FROM stdin;
90	Sizing Issue with TacticalPro Gloves	["ben.thompson@email.com", "support@gauntletairon.com"]	active	2025-06-14 09:27:46.526	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
91	Order Delay for DragonScale Gauntlets	["sarah.k@email.com", "support@gauntletairon.com"]	active	2025-06-13 23:59:59.54	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
92	Break-In Period for CyberKnight Collection	["chris.j@email.com", "support@gauntletairon.com"]	active	2025-07-07 19:17:42.615	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
93	Leather Care Instructions Needed	["emma.lee@email.com", "support@gauntletairon.com"]	active	2025-07-03 15:06:02.011	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
94	Interested in Custom Fitting Services	["mark.r@email.com", "support@gauntletairon.com"]	active	2025-06-24 23:19:21.451	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
95	Metal Polishing for RoadGuard Series	["jess@email.com", "support@gauntletairon.com"]	active	2025-06-28 02:09:15.817	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
96	ANGRY: Poor Customer Service!	["alexb@email.com", "support@gauntletairon.com"]	active	2025-07-10 08:25:14.433	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
97	Sales Inquiry - Bulk Order Discount	["officer.kate@email.com", "support@gauntletairon.com"]	active	2025-07-06 19:49:19.082	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
98	Legal Inquiry Regarding Order	["liam.s@email.com", "support@gauntletairon.com"]	active	2025-06-15 07:13:59.811	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
99	Partnership Inquiry for Promotional Events	["tom.r@email.com", "support@gauntletairon.com"]	active	2025-06-28 08:15:48.839	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
100	Help with Order Payment Issue	["lucy@email.com", "support@gauntletairon.com"]	active	2025-06-23 23:00:05.569	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
101	Warranty Coverage Inquiry	["jeff.d@email.com", "support@gauntletairon.com"]	active	2025-06-29 11:33:09.905	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
102	Request for Product Specifications	["nina.m@email.com", "support@gauntletairon.com"]	active	2025-06-20 23:31:46.018	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
103	Issue with LED Lights on CyberKnight Gloves	["mike.p@email.com", "support@gauntletairon.com"]	active	2025-07-05 11:23:29.629	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
104	Gloves Running Small?	["liam.w@email.com", "support@gauntletairon.com"]	active	2025-06-15 17:54:07.764	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
105	Feedback on last order	["rita.j@email.com", "support@gauntletairon.com"]	active	2025-07-10 15:40:40.254	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
106	Checking Status of Custom Order	["danny.g@email.com", "support@gauntletairon.com"]	active	2025-06-13 04:24:06.917	2025-07-12 16:02:04.798342	2025-07-12 16:02:04.798342
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: email_agent
--

COPY public.users (id, email, name, role, created_at, updated_at, stack_auth_id, password_hash, last_login_at, refresh_token_revoked_at) FROM stdin;
80	demo@user.com	Demo User	agent	2025-07-12 16:02:04.796098	2025-07-12 16:02:04.796098	\N	$2b$12$wpj0yHT6dsXDHC/uc.13NO153HE2GYveGyYIVbX6OiWsJcitEK87S	\N	\N
81	john.agent@company.com	John Agent	agent	2025-07-12 16:02:04.796098	2025-07-12 16:02:04.796098	\N	\N	\N	\N
82	sarah.manager@company.com	Sarah Manager	manager	2025-07-12 16:02:04.796098	2025-07-12 16:02:04.796098	\N	\N	\N	\N
83	mike.admin@company.com	Mike Admin	admin	2025-07-12 16:02:04.796098	2025-07-12 16:02:04.796098	\N	\N	\N	\N
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: email_agent
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 7, true);


--
-- Name: agent_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: email_agent
--

SELECT pg_catalog.setval('public.agent_actions_id_seq', 72, true);


--
-- Name: draft_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: email_agent
--

SELECT pg_catalog.setval('public.draft_responses_id_seq', 72, true);


--
-- Name: email_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: email_agent
--

SELECT pg_catalog.setval('public.email_tags_id_seq', 1, false);


--
-- Name: emails_id_seq; Type: SEQUENCE SET; Schema: public; Owner: email_agent
--

SELECT pg_catalog.setval('public.emails_id_seq', 160, true);


--
-- Name: threads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: email_agent
--

SELECT pg_catalog.setval('public.threads_id_seq', 106, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: email_agent
--

SELECT pg_catalog.setval('public.users_id_seq', 83, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: email_agent
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: agent_actions agent_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.agent_actions
    ADD CONSTRAINT agent_actions_pkey PRIMARY KEY (id);


--
-- Name: draft_responses draft_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.draft_responses
    ADD CONSTRAINT draft_responses_pkey PRIMARY KEY (id);


--
-- Name: email_tags email_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.email_tags
    ADD CONSTRAINT email_tags_pkey PRIMARY KEY (id);


--
-- Name: emails emails_pkey; Type: CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT emails_pkey PRIMARY KEY (id);


--
-- Name: threads threads_pkey; Type: CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_stack_auth_id_unique; Type: CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_stack_auth_id_unique UNIQUE (stack_auth_id);


--
-- Name: actor_idx; Type: INDEX; Schema: public; Owner: email_agent
--

CREATE INDEX actor_idx ON public.agent_actions USING btree (actor_user_id);


--
-- Name: email_tag_idx; Type: INDEX; Schema: public; Owner: email_agent
--

CREATE INDEX email_tag_idx ON public.email_tags USING btree (email_id, tag);


--
-- Name: tag_idx; Type: INDEX; Schema: public; Owner: email_agent
--

CREATE INDEX tag_idx ON public.email_tags USING btree (tag);


--
-- Name: thread_timeline_idx; Type: INDEX; Schema: public; Owner: email_agent
--

CREATE INDEX thread_timeline_idx ON public.agent_actions USING btree (thread_id, created_at DESC);


--
-- Name: agent_actions agent_actions_actor_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.agent_actions
    ADD CONSTRAINT agent_actions_actor_user_id_users_id_fk FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: agent_actions agent_actions_draft_response_id_draft_responses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.agent_actions
    ADD CONSTRAINT agent_actions_draft_response_id_draft_responses_id_fk FOREIGN KEY (draft_response_id) REFERENCES public.draft_responses(id) ON DELETE SET NULL;


--
-- Name: agent_actions agent_actions_email_id_emails_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.agent_actions
    ADD CONSTRAINT agent_actions_email_id_emails_id_fk FOREIGN KEY (email_id) REFERENCES public.emails(id) ON DELETE SET NULL;


--
-- Name: agent_actions agent_actions_thread_id_threads_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.agent_actions
    ADD CONSTRAINT agent_actions_thread_id_threads_id_fk FOREIGN KEY (thread_id) REFERENCES public.threads(id) ON DELETE RESTRICT;


--
-- Name: draft_responses draft_responses_created_by_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.draft_responses
    ADD CONSTRAINT draft_responses_created_by_user_id_users_id_fk FOREIGN KEY (created_by_user_id) REFERENCES public.users(id);


--
-- Name: draft_responses draft_responses_email_id_emails_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.draft_responses
    ADD CONSTRAINT draft_responses_email_id_emails_id_fk FOREIGN KEY (email_id) REFERENCES public.emails(id);


--
-- Name: draft_responses draft_responses_thread_id_threads_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.draft_responses
    ADD CONSTRAINT draft_responses_thread_id_threads_id_fk FOREIGN KEY (thread_id) REFERENCES public.threads(id);


--
-- Name: email_tags email_tags_created_by_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.email_tags
    ADD CONSTRAINT email_tags_created_by_user_id_users_id_fk FOREIGN KEY (created_by_user_id) REFERENCES public.users(id);


--
-- Name: email_tags email_tags_email_id_emails_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.email_tags
    ADD CONSTRAINT email_tags_email_id_emails_id_fk FOREIGN KEY (email_id) REFERENCES public.emails(id) ON DELETE CASCADE;


--
-- Name: emails emails_thread_id_threads_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: email_agent
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT emails_thread_id_threads_id_fk FOREIGN KEY (thread_id) REFERENCES public.threads(id);


--
-- PostgreSQL database dump complete
--

