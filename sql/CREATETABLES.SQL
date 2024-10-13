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