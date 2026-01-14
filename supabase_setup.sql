-- ==========================================
-- SETUP SUPABASE: RLS & SEED DATA
-- ==========================================

-- 1. POLÍTICAS DE RLS PARA STORAGE (Bucket 'videos')
-- Certifique-se de que o bucket 'videos' já foi criado no Supabase Storage.

-- Permitir leitura pública dos vídeos
CREATE POLICY "Videos Public Read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'videos');

-- Permitir upload apenas para usuários autenticados (Admins)
CREATE POLICY "Admin Video Upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'videos');

-- 2. SEED DOS DIAS RESTANTES (Dias 2 a 7)
-- Usando ON CONFLICT para evitar duplicatas caso já existam.

DO $$
DECLARE
    jornada_id UUID;
BEGIN
    -- DIA 2
    INSERT INTO jornadas (dia_number, dia_label, preletor, igreja_preletor, titulo, versiculo_texto, versiculo_referencia, ensinamentos, video_url_principal, video_url_proximo_dia)
    VALUES (2, 'DIA 2 • 2025-01-21', 'PL Rios', 'IIR Brasil', 'Buscando a Direção de Deus', 'Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.', 'Provérbios 3:6', ARRAY['Reconhecer Deus é mais do que saber que Ele existe', 'Em cada decisão, busque a vontade divina', 'Deus promete endireitar nossos caminhos'], 'https://storage.example.com/videos/dia2-main.mp4', 'https://storage.example.com/videos/dia2-pastor.mp4')
    ON CONFLICT (dia_number) DO UPDATE SET 
        titulo = EXCLUDED.titulo,
        preletor = EXCLUDED.preletor
    RETURNING id INTO jornada_id;

    INSERT INTO perguntas_quiz (jornada_id, pergunta, alternativas, resposta_correta, explicacao)
    VALUES 
    (jornada_id, 'O que significa "reconhecer a Deus"?', ARRAY['Apenas ir à igreja', 'Incluí-lo em todas as decisões', 'Fazer orações antes das refeições', 'Ler a Bíblia uma vez por semana'], 1, 'Reconhecer a Deus significa incluí-lo em todos os aspectos da nossa vida.'),
    (jornada_id, 'O que Deus promete fazer quando O reconhecemos?', ARRAY['Nos dar riquezas', 'Endireitar nossas veredas', 'Remover todos os problemas', 'Nos dar fama'], 1, 'A promessa é que Ele endireitará as nossas veredas.'),
    (jornada_id, 'Em quais caminhos devemos reconhecer a Deus?', ARRAY['Apenas nos difíceis', 'Apenas nos fáceis', 'Em todos', 'Apenas no trabalho'], 2, 'Devemos reconhecê-lo em TODOS os nossos caminhos.');

    -- DIA 3
    INSERT INTO jornadas (dia_number, dia_label, preletor, igreja_preletor, titulo, versiculo_texto, versiculo_referencia, ensinamentos, video_url_principal, video_url_proximo_dia)
    VALUES (3, 'DIA 3 • 2025-01-22', 'Pr. Vitor Ledo', 'Link Church', 'O Temor do Senhor', 'O temor do Senhor é o princípio do conhecimento; mas os insensatos desprezam a sabedoria e a instrução.', 'Provérbios 1:7', ARRAY['O temor do Senhor não é medo, mas reverência', 'A sabedoria começa com o reconhecimento de quem Deus é', 'Os insensatos rejeitam a instrução divina'], 'https://storage.example.com/videos/dia3-main.mp4', 'https://storage.example.com/videos/dia3-pastor.mp4')
    ON CONFLICT (dia_number) DO UPDATE SET titulo = EXCLUDED.titulo RETURNING id INTO jornada_id;

    INSERT INTO perguntas_quiz (jornada_id, pergunta, alternativas, resposta_correta, explicacao)
    VALUES 
    (jornada_id, 'O que é o princípio do conhecimento?', ARRAY['A escola', 'O temor do Senhor', 'A experiência', 'A inteligência natural'], 1, 'O temor do Senhor é o princípio do conhecimento.'),
    (jornada_id, 'Quem despreza a sabedoria e a instrução?', ARRAY['Os sábios', 'Os jovens', 'Os insensatos', 'Os pobres'], 2, 'Os insensatos desprezam a sabedoria e a instrução.'),
    (jornada_id, 'O temor do Senhor é sinônimo de:', ARRAY['Medo', 'Reverência', 'Pavor', 'Ansiedade'], 1, 'O temor do Senhor significa reverência e respeito profundo.');

    -- DIA 4
    INSERT INTO jornadas (dia_number, dia_label, preletor, igreja_preletor, titulo, versiculo_texto, versiculo_referencia, ensinamentos, video_url_principal, video_url_proximo_dia)
    VALUES (4, 'DIA 4 • 2025-01-23', 'Pr. Vitor Ledo', 'Link Church', 'Guardando o Coração', 'Sobre tudo o que se deve guardar, guarda o teu coração, porque dele procedem as saídas da vida.', 'Provérbios 4:23', ARRAY['O coração é a fonte de tudo que fazemos', 'Guardar o coração requer intencionalidade', 'O que permitimos entrar afeta o que sai'], 'https://storage.example.com/videos/dia4-main.mp4', 'https://storage.example.com/videos/dia4-pastor.mp4')
    ON CONFLICT (dia_number) DO UPDATE SET titulo = EXCLUDED.titulo RETURNING id INTO jornada_id;

    INSERT INTO perguntas_quiz (jornada_id, pergunta, alternativas, resposta_correta, explicacao)
    VALUES 
    (jornada_id, 'O que devemos guardar acima de tudo?', ARRAY['O dinheiro', 'O tempo', 'O coração', 'Os bens'], 2, 'Devemos guardar o coração acima de tudo.'),
    (jornada_id, 'O que procede do coração?', ARRAY['Os pensamentos', 'As saídas da vida', 'As emoções', 'Os sonhos'], 1, 'Do coração procedem as saídas da vida.'),
    (jornada_id, 'Por que guardar o coração é tão importante?', ARRAY['Porque ele é frágil', 'Porque dele procede a vida', 'Porque é mandamento', 'Porque Deus está observando'], 1, 'É importante porque dele procedem as saídas da vida.');

    -- DIA 5
    INSERT INTO jornadas (dia_number, dia_label, preletor, igreja_preletor, titulo, versiculo_texto, versiculo_referencia, ensinamentos, video_url_principal, video_url_proximo_dia)
    VALUES (5, 'DIA 5 • 2025-01-24', 'Pr. Vitor Ledo', 'Link Church', 'A Língua Sábia', 'A língua branda quebranta ossos.', 'Provérbios 25:15b', ARRAY['Palavras têm poder de construir ou destruir', 'A brandura é mais poderosa que a força', 'Sabedoria se manifesta no falar'], 'https://storage.example.com/videos/dia5-main.mp4', 'https://storage.example.com/videos/dia5-pastor.mp4')
    ON CONFLICT (dia_number) DO UPDATE SET titulo = EXCLUDED.titulo RETURNING id INTO jornada_id;

    INSERT INTO perguntas_quiz (jornada_id, pergunta, alternativas, resposta_correta, explicacao)
    VALUES 
    (jornada_id, 'O que a língua branda pode fazer?', ARRAY['Acalmar', 'Quebrantar ossos', 'Curar', 'Ensinar'], 1, 'A língua branda quebranta ossos - tem poder de convencer e transformar.'),
    (jornada_id, 'Qual característica da língua é elogiada em Provérbios?', ARRAY['Rapidez', 'Força', 'Brandura', 'Volume'], 2, 'A brandura é a característica elogiada.'),
    (jornada_id, 'As palavras têm poder de:', ARRAY['Apenas informar', 'Construir e destruir', 'Apenas entreter', 'Apenas expressar'], 1, 'As palavras têm poder tanto de construir quanto de destruir.');

    -- DIA 6
    INSERT INTO jornadas (dia_number, dia_label, preletor, igreja_preletor, titulo, versiculo_texto, versiculo_referencia, ensinamentos, video_url_principal, video_url_proximo_dia)
    VALUES (6, 'DIA 6 • 2025-01-25', 'Pr. Vitor Ledo', 'Link Church', 'A Bondade que Transforma', 'O que segue a justiça e a bondade achará a vida, a justiça e a honra.', 'Provérbios 21:21', ARRAY['Bondade e justiça caminham juntas', 'A busca pela bondade traz recompensas', 'Honra é fruto de uma vida íntegra'], 'https://storage.example.com/videos/dia6-main.mp4', 'https://storage.example.com/videos/dia6-pastor.mp4')
    ON CONFLICT (dia_number) DO UPDATE SET titulo = EXCLUDED.titulo RETURNING id INTO jornada_id;

    INSERT INTO perguntas_quiz (jornada_id, pergunta, alternativas, resposta_correta, explicacao)
    VALUES 
    (jornada_id, 'O que encontra quem segue a justiça e a bondade?', ARRAY['Riquezas', 'A vida, justiça e honra', 'Poder', 'Fama'], 1, 'Quem segue justiça e bondade acha vida, justiça e honra.'),
    (jornada_id, 'Bondade e justiça são:', ARRAY['Opostos', 'Complementares', 'Independentes', 'Contraditórios'], 1, 'Bondade e justiça são complementares e caminham juntas.'),
    (jornada_id, 'A honra vem de:', ARRAY['Status social', 'Uma vida íntegra', 'Dinheiro', 'Popularidade'], 1, 'A honra é fruto de uma vida íntegra.');

    -- DIA 7
    INSERT INTO jornadas (dia_number, dia_label, preletor, igreja_preletor, titulo, versiculo_texto, versiculo_referencia, ensinamentos, video_url_principal, video_url_proximo_dia)
    VALUES (7, 'DIA 7 • 2025-01-26', 'Pr. Vitor Ledo', 'Link Church', 'Vimos e Provamos a Bondade de Deus', 'Provai e vede que o Senhor é bom; bem-aventurado o homem que nele confia.', 'Salmos 34:8', ARRAY['A bondade de Deus deve ser experimentada', 'Provar é ter experiência pessoal', 'Bem-aventurado é quem confia no Senhor'], 'https://storage.example.com/videos/dia7-main.mp4', 'https://storage.example.com/videos/dia7-pastor.mp4')
    ON CONFLICT (dia_number) DO UPDATE SET titulo = EXCLUDED.titulo RETURNING id INTO jornada_id;

    INSERT INTO perguntas_quiz (jornada_id, pergunta, alternativas, resposta_correta, explicacao)
    VALUES 
    (jornada_id, 'O que somos convidados a fazer segundo Salmos 34:8?', ARRAY['Ler e meditar', 'Provar e ver', 'Orar e jejuar', 'Cantar e louvar'], 1, 'Somos convidados a provar e ver que o Senhor é bom.'),
    (jornada_id, 'Quem é bem-aventurado segundo o versículo?', ARRAY['O que é rico', 'O homem que nele confia', 'O que tem saúde', 'O que é sábio'], 1, 'Bem-aventurado é o homem que confia no Senhor.'),
    (jornada_id, 'O que significa "provar" a bondade de Deus?', ARRAY['Teorizar sobre ela', 'Experimentá-la pessoalmente', 'Ler sobre ela', 'Ouvir testemunhos'], 1, 'Provar significa ter uma experiência pessoal da bondade de Deus.');

END $$;
