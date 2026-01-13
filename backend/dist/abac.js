export const PRIV = {
    TODO_VIEW_ALL: "todo:view:all",
    TODO_VIEW_OWN: "todo:view:own",
    TODO_CREATE_OWN: "todo:create:own",
    TODO_UPDATE_OWN: "todo:update:own",
    TODO_DELETE_OWN_DRAFT: "todo:delete:own:draft",
    TODO_DELETE_ANY: "todo:delete:any",
};
function has(ctx, privilegeKey) {
    return ctx.privileges.includes(privilegeKey);
}
export function can(ctx, action, todo) {
    switch (action) {
        case "view_all":
            return has(ctx, PRIV.TODO_VIEW_ALL) ? { allowed: true } : { allowed: false, reason: "Missing privilege todo:view:all" };
        case "view_own":
            return has(ctx, PRIV.TODO_VIEW_OWN) ? { allowed: true } : { allowed: false, reason: "Missing privilege todo:view:own" };
        case "create_own":
            return has(ctx, PRIV.TODO_CREATE_OWN) ? { allowed: true } : { allowed: false, reason: "Missing privilege todo:create:own" };
        case "update_own": {
            if (!has(ctx, PRIV.TODO_UPDATE_OWN))
                return { allowed: false, reason: "Missing privilege todo:update:own" };
            if (!todo)
                return { allowed: false, reason: "Missing todo context." };
            if (todo.ownerId !== ctx.user.id)
                return { allowed: false, reason: "Can only update your own todos." };
            return { allowed: true };
        }
        case "delete_any":
            return has(ctx, PRIV.TODO_DELETE_ANY) ? { allowed: true } : { allowed: false, reason: "Missing privilege todo:delete:any" };
        case "delete_own_draft": {
            if (!has(ctx, PRIV.TODO_DELETE_OWN_DRAFT))
                return { allowed: false, reason: "Missing privilege todo:delete:own:draft" };
            if (!todo)
                return { allowed: false, reason: "Missing todo context." };
            if (todo.ownerId !== ctx.user.id)
                return { allowed: false, reason: "Can only delete your own todos." };
            if (todo.status !== "draft")
                return { allowed: false, reason: 'Can only delete todos in "draft" status.' };
            return { allowed: true };
        }
    }
}
