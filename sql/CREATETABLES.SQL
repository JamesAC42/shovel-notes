CREATE TABLE notebooks
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    room_id integer NOT NULL,
    CONSTRAINT notebooks_pkey PRIMARY KEY (id),
    CONSTRAINT notebooks_room_id_fkey FOREIGN KEY (room_id)
        REFERENCES public.room (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE notebook_pages
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    notebook_id integer NOT NULL,
    parent_id integer,
    title character varying(100) COLLATE pg_catalog."default" NOT NULL,
    content text COLLATE pg_catalog."default",
    "order" integer NOT NULL,
    last_edited_by integer,
    last_edited_at timestamp without time zone,
    is_folder boolean,
    CONSTRAINT notebook_pages_pkey PRIMARY KEY (id),
    CONSTRAINT notebook_pages_last_edited_by_fkey FOREIGN KEY (last_edited_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT notebook_pages_notebook_id_fkey FOREIGN KEY (notebook_id)
        REFERENCES public.notebooks (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT notebook_pages_parent_id_fkey FOREIGN KEY (parent_id)
        REFERENCES public.notebook_pages (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE decks
(
    room integer NOT NULL,
    title character varying(100) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone NOT NULL,
    last_edited_by integer,
    notebook integer NOT NULL,
    last_edited_at timestamp without time zone NOT NULL,
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    last_studied_at timestamp without time zone,
    CONSTRAINT decks_pkey PRIMARY KEY (id),
    CONSTRAINT last_edited_by FOREIGN KEY (last_edited_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT notebook FOREIGN KEY (notebook)
        REFERENCES public.notebooks (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT room FOREIGN KEY (room)
        REFERENCES public.room (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE flashcards
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    deck integer NOT NULL,
    front character varying(500) COLLATE pg_catalog."default",
    back character varying(500) COLLATE pg_catalog."default",
    is_starred boolean,
    is_learned boolean,
    created_at timestamp without time zone NOT NULL,
    CONSTRAINT flashcards_pkey PRIMARY KEY (id),
    CONSTRAINT deck FOREIGN KEY (deck)
        REFERENCES public.decks (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE quizzes
(
    room integer NOT NULL,
    title character varying(100) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone NOT NULL,
    last_edited_by integer,
    notebook integer NOT NULL,
    last_edited_at timestamp without time zone NOT NULL,
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    last_studied_at timestamp without time zone,
    CONSTRAINT quizzes_pkey PRIMARY KEY (id),
    CONSTRAINT last_edited_by FOREIGN KEY (last_edited_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT notebook FOREIGN KEY (notebook)
        REFERENCES public.notebooks (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT room FOREIGN KEY (room)
        REFERENCES public.room (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE quiz_questions
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    quiz_id integer NOT NULL,
    question_type integer NOT NULL, -- 1 for multiple choice, 2 for short answer
    prompt text COLLATE pg_catalog."default" NOT NULL,
    question_order integer NOT NULL,
    CONSTRAINT quiz_questions_pkey PRIMARY KEY (id),
    CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id)
        REFERENCES public.quizzes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE quiz_answers
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    question_id integer NOT NULL,
    answer_value text COLLATE pg_catalog."default" NOT NULL,
    is_correct boolean DEFAULT false,
    CONSTRAINT quiz_answers_pkey PRIMARY KEY (id),
    CONSTRAINT quiz_answers_question_id_fkey FOREIGN KEY (question_id)
        REFERENCES public.quiz_questions (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE quiz_attempts
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    quiz_id integer NOT NULL,
    user_id integer NOT NULL,
    started_at timestamp without time zone NOT NULL,
    completed_at timestamp without time zone,
    overall_score numeric(5,2),
    overall_feedback text,
    total_questions integer NOT NULL,
    CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id),
    CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id)
        REFERENCES public.quizzes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE quiz_attempt_questions
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    attempt_id integer NOT NULL,
    original_question_id integer NOT NULL,
    question_type integer NOT NULL,
    prompt text NOT NULL,
    question_order integer NOT NULL,
    CONSTRAINT quiz_attempt_questions_pkey PRIMARY KEY (id),
    CONSTRAINT quiz_attempt_questions_attempt_id_fkey FOREIGN KEY (attempt_id)
        REFERENCES public.quiz_attempts (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT quiz_attempt_questions_original_question_id_fkey FOREIGN KEY (original_question_id)
        REFERENCES public.quiz_questions (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE quiz_attempt_answers
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    attempt_question_id integer NOT NULL,
    answer_value text NOT NULL,
    is_correct boolean,
    ai_feedback text,
    points_awarded numeric(5,2),
    CONSTRAINT quiz_attempt_answers_pkey PRIMARY KEY (id),
    CONSTRAINT quiz_attempt_answers_attempt_question_id_fkey FOREIGN KEY (attempt_question_id)
        REFERENCES public.quiz_attempt_questions (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

