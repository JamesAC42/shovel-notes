CREATE TABLE notebooks
(
    id integer NOT NULL DEFAULT nextval('notebooks_id_seq'::regclass),
    room_id integer NOT NULL,
    CONSTRAINT notebooks_pkey PRIMARY KEY (id),
    CONSTRAINT notebooks_room_id_fkey FOREIGN KEY (room_id)
        REFERENCES public.room (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE notebook_pages
(
    id integer NOT NULL DEFAULT nextval('notebook_pages_id_seq'::regclass),
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