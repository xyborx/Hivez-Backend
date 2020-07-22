--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3
-- Dumped by pg_dump version 12.3

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
-- Name: Hivez; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE "Hivez" WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'English_Indonesia.1252' LC_CTYPE = 'English_Indonesia.1252';


ALTER DATABASE "Hivez" OWNER TO postgres;

\connect "Hivez"

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_change_password; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_change_password (
    audit_change_password_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    audit_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    audit_user_login_id uuid NOT NULL
);


ALTER TABLE public.audit_change_password OWNER TO postgres;

--
-- Name: audit_user_login; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_user_login (
    audit_user_login_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    user_id uuid NOT NULL,
    ip_address character varying(15) NOT NULL,
    reason character varying(20) NOT NULL,
    audit_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_user_login OWNER TO postgres;

--
-- Name: bill_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bill_payments (
    bill_payment_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    bill_id uuid NOT NULL,
    payer_user_id uuid NOT NULL,
    payment_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    receipt_picture text,
    approval_status character varying(10),
    approver_user_id uuid,
    approval_date timestamp with time zone
);


ALTER TABLE public.bill_payments OWNER TO postgres;

--
-- Name: bills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bills (
    bill_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    creator_user_id uuid NOT NULL,
    group_id uuid NOT NULL,
    bill_description character varying(100) NOT NULL,
    creation_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    approval_status character varying(10),
    approver_user_id uuid,
    bill_amount bigint NOT NULL,
    approval_date timestamp with time zone
);


ALTER TABLE public.bills OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    event_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    event_name character varying(30) NOT NULL,
    is_searchable "char" DEFAULT 'Y'::"char" NOT NULL,
    is_deleted "char" DEFAULT 'N'::"char" NOT NULL,
    related_group_id uuid,
    event_description text,
    total_expense bigint DEFAULT 0 NOT NULL,
    event_picture text,
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_date timestamp with time zone
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: events_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events_members (
    event_member_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    user_id uuid NOT NULL,
    event_id uuid NOT NULL,
    role character varying(10) NOT NULL,
    join_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_left "char" DEFAULT 'N'::"char" NOT NULL,
    left_date timestamp with time zone,
    is_favourite "char" DEFAULT 'N'::"char" NOT NULL
);


ALTER TABLE public.events_members OWNER TO postgres;

--
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    group_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    group_name character varying(30) NOT NULL,
    group_description text,
    is_searchable "char" DEFAULT 'Y'::"char" NOT NULL,
    is_deleted "char" DEFAULT 'N'::"char" NOT NULL,
    group_balance bigint DEFAULT 0 NOT NULL,
    group_picture text,
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_date timestamp with time zone
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- Name: groups_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups_members (
    group_member_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    user_id uuid NOT NULL,
    group_id uuid NOT NULL,
    role character varying(10) NOT NULL,
    join_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_left "char" DEFAULT 'N'::"char" NOT NULL,
    left_date timestamp with time zone,
    is_favourite "char" DEFAULT 'N'::"char" NOT NULL
);


ALTER TABLE public.groups_members OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    notification_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    notification_type character varying(50) NOT NULL,
    source_id uuid NOT NULL,
    source_type character varying(10) NOT NULL,
    user_id uuid NOT NULL,
    notification_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requests (
    request_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    requester_user_id uuid NOT NULL,
    source_id uuid NOT NULL,
    request_description character varying(100) NOT NULL,
    request_amount bigint NOT NULL,
    created_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    receipt_picture text,
    approval_status character varying(10),
    approver_user_id uuid,
    approval_date timestamp with time zone,
    source_type character varying(10) NOT NULL,
    request_type character varying(10) NOT NULL,
    request_date timestamp with time zone NOT NULL
);


ALTER TABLE public.requests OWNER TO postgres;

--
-- Name: requests_payees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.requests_payees (
    request_payee_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    request_id uuid NOT NULL,
    payee_user_id uuid NOT NULL,
    amount bigint NOT NULL
);


ALTER TABLE public.requests_payees OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    join_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_searchable "char" DEFAULT 'Y'::"char" NOT NULL,
    is_deleted "char" DEFAULT 'N'::"char" NOT NULL,
    deleted_date timestamp with time zone,
    user_picture text,
    is_reset_password "char" DEFAULT 'N'::"char" NOT NULL,
    user_name character varying(20) NOT NULL,
    full_name character varying(50) NOT NULL,
    email character varying(200) NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_invitations (
    user_invitation_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    inviter_user_id uuid NOT NULL,
    invitation_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    invited_user_id uuid NOT NULL,
    invited_source_id uuid NOT NULL,
    approval_status character varying(10),
    approval_date timestamp with time zone,
    invited_source_type character varying(10) NOT NULL
);


ALTER TABLE public.users_invitations OWNER TO postgres;

--
-- Name: users_join_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_join_requests (
    user_join_request_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    requester_user_id uuid NOT NULL,
    source_id uuid NOT NULL,
    source_type character varying(10) NOT NULL,
    request_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    approval_status character varying(10),
    approval_date timestamp with time zone,
    approver_user_id uuid
);


ALTER TABLE public.users_join_requests OWNER TO postgres;

--
-- Name: users_login_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_login_data (
    user_login_data_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    user_id uuid NOT NULL,
    login_token text,
    login_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users_login_data OWNER TO postgres;

--
-- Name: audit_change_password audit_change_password_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_change_password
    ADD CONSTRAINT audit_change_password_pkey PRIMARY KEY (audit_change_password_id);


--
-- Name: audit_user_login audit_user_login_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_user_login
    ADD CONSTRAINT audit_user_login_pkey PRIMARY KEY (audit_user_login_id);


--
-- Name: bills bill_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bill_pkey PRIMARY KEY (bill_id);


--
-- Name: events_members event_member_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events_members
    ADD CONSTRAINT event_member_pkey PRIMARY KEY (event_member_id);


--
-- Name: events event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT event_pkey PRIMARY KEY (event_id);


--
-- Name: groups group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT group_pkey PRIMARY KEY (group_id);


--
-- Name: notifications notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notification_pkey PRIMARY KEY (notification_id);


--
-- Name: users_join_requests user_join_approval_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_join_requests
    ADD CONSTRAINT user_join_approval_pkey PRIMARY KEY (user_join_request_id);


--
-- Name: users_invitations user_join_invitation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_invitations
    ADD CONSTRAINT user_join_invitation_pkey PRIMARY KEY (user_invitation_id);


--
-- Name: users_login_data user_login_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_login_data
    ADD CONSTRAINT user_login_data_pkey PRIMARY KEY (user_login_data_id);


--
-- Name: users user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_pkey PRIMARY KEY (user_id);


--
-- PostgreSQL database dump complete
--

