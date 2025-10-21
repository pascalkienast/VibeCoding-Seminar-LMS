-- Tools table
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Tool likes table
CREATE TABLE IF NOT EXISTS tool_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tool_id, user_id)
);

-- Tool comments table
CREATE TABLE IF NOT EXISTS tool_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tools
CREATE POLICY "Anyone can view tools" ON tools FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tools" ON tools FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own tools" ON tools FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own tools" ON tools FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for tool_likes
CREATE POLICY "Anyone can view tool likes" ON tool_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create likes" ON tool_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON tool_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tool_comments
CREATE POLICY "Anyone can view tool comments" ON tool_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON tool_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON tool_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON tool_comments FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_tools_created_at ON tools(created_at DESC);
CREATE INDEX idx_tool_likes_tool_id ON tool_likes(tool_id);
CREATE INDEX idx_tool_likes_user_id ON tool_likes(user_id);
CREATE INDEX idx_tool_comments_tool_id ON tool_comments(tool_id);
CREATE INDEX idx_tool_comments_created_at ON tool_comments(created_at DESC);

-- Optional: Insert some sample tools
-- INSERT INTO tools (title, url, description) VALUES
-- ('Cursor', 'https://cursor.sh', 'AI-powered code editor'),
-- ('GitHub Copilot', 'https://github.com/features/copilot', 'AI pair programmer'),
-- ('ChatGPT', 'https://chat.openai.com', 'Conversational AI assistant');

