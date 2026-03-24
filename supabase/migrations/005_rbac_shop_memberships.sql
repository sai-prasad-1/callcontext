-- =============================================
-- RBAC: shop memberships (multi-user per shop)
-- =============================================
-- Backfill creates an owner membership for every existing shop.
-- New shops get owner membership via trigger.

CREATE TABLE shop_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff', 'analyst')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (shop_id, user_id)
);

CREATE INDEX idx_shop_memberships_user_id ON shop_memberships(user_id) WHERE status = 'active';
CREATE INDEX idx_shop_memberships_shop_id ON shop_memberships(shop_id) WHERE status = 'active';

CREATE OR REPLACE FUNCTION public.set_shop_memberships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shop_memberships_updated_at
  BEFORE UPDATE ON shop_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.set_shop_memberships_updated_at();

-- Auto-create owner membership when a shop is inserted (covers signup + admin inserts)
CREATE OR REPLACE FUNCTION public.create_owner_shop_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.shop_memberships (shop_id, user_id, role, status)
  VALUES (NEW.id, NEW.owner_id, 'owner', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER shops_create_owner_membership
  AFTER INSERT ON shops
  FOR EACH ROW
  EXECUTE FUNCTION public.create_owner_shop_membership();

-- Backfill existing shops (trigger does not run for past rows)
INSERT INTO shop_memberships (shop_id, user_id, role, status)
SELECT id, owner_id, 'owner', 'active'
FROM shops
ON CONFLICT (shop_id, user_id) DO NOTHING;

ALTER TABLE shop_memberships ENABLE ROW LEVEL SECURITY;
