import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: () => import("./views/Login.vue"),
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("./views/admin/Admin.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/users",
      name: "admin-users",
      component: () => import("./views/admin/UserList.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/database",
      name: "admin-database",
      component: () => import("./views/admin/Database.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/settings",
      name: "admin-settings",
      component: () => import("./views/admin/Settings.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/quizEdit/:id",
      name: "quizEdit",
      component: () => import("./views/admin/QuizEdit.vue"),
    },

    //ToDo:  Remove this POLL reference. This is a test view.
    {
      path: "/poll",
      name: "poll",
      component: () => import("./views/admin/Poll.vue"),
    },
    //  VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
    //  ToDo:  Remove RECIPE references
    {
      path: "/recipes",
      name: "recipes",
      component: () => import("./views/RecipeList.vue"),
    },
    {
      path: "/recipe/:id",
      name: "editRecipe",
      props: true,
      component: () => import("./views/EditRecipe.vue"),
    },
    {
      path: "/ingredients",
      name: "ingredients",
      component: () => import("./views/IngredientList.vue"),
    },
    //  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  ],
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Add "Global Navigation Guard" to check authentication and/or
//  authorization before displaying views.
router.beforeEach((to, from, next) => {
  //  Get any currently logged in user
  const user = JSON.parse(localStorage.getItem("user"));

  //  Check if the route requires admin privileges
  if (to.meta.requiresAdmin) {
    if (user && user.role === "admin") {
      next(); //  User is an admin, allow access
    } else {
      //  Not an admin or not logged in, redirect to a safe page
      next({ name: "recipes" });
    }
  } else if (to.meta.requiresAuth && !user) {
    //  If route requires login and user is not logged in, redirect to login
    next({ name: "login" });
  } else {
    next(); //  Otherwise, allow access
  }
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export default router;
