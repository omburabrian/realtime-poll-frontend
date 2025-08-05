<script setup>
import { ref, onMounted } from "vue";
import CourseServices from "../../services/CourseServices.js";

const courses = ref([]);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

// Add/Edit State
const isDialogOpen = ref(false);
const isEditing = ref(false);
const editedCourse = ref({ id: null, name: "" });

// Fetch courses on mount
onMounted(async () => {
  await getCourses();
});

async function getCourses() {
  try {
    const response = await CourseServices.getCourses();
    courses.value = response.data;
  } catch (error) {
    console.error(error);
    showSnackbar("error", "Failed to load courses.");
  }
}

function openAddDialog() {
  isEditing.value = false;
  editedCourse.value = { id: null, name: "" };
  isDialogOpen.value = true;
}

function openEditDialog(course) {
  isEditing.value = true;
  editedCourse.value = { ...course };
  isDialogOpen.value = true;
}

async function saveCourse() {
  if (!editedCourse.value.name.trim()) {
    showSnackbar("error", "Course name is required.");
    return;
  }

  try {
    if (isEditing.value) {
      await CourseServices.updateCourse(editedCourse.value.id, {
        name: editedCourse.value.name,
      });
      showSnackbar("green", "Course updated.");
    } else {
      await CourseServices.addCourse({ name: editedCourse.value.name });
      showSnackbar("green", "Course added.");
    }
    isDialogOpen.value = false;
    await getCourses();
  } catch (error) {
    console.error(error);
    showSnackbar("error", "Failed to save course.");
  }
}

async function deleteCourse(courseId) {
  try {
    await CourseServices.deleteCourse(courseId);
    showSnackbar("green", "Course deleted.");
    await getCourses();
  } catch (error) {
    console.error(error);
    showSnackbar("error", "Failed to delete course.");
  }
}

function showSnackbar(color, text) {
  snackbar.value.color = color;
  snackbar.value.text = text;
  snackbar.value.value = true;
}
</script>

<template>
  <v-container>
    <div id="body">
     
      <v-row align="center" class="mb-4">
        <v-col cols="8">
          <v-card-title class="pl-0 text-h4 font-weight-bold">Courses</v-card-title>
        </v-col>
        <v-col cols="4" class="d-flex justify-end align-center">
          <v-btn color="primary" @click="openAddDialog">Add Course</v-btn>
        </v-col>
      </v-row>

  
      <v-card v-for="course in courses" :key="course.id" class="mb-2 pa-3 d-flex justify-between align-center">
        <div class="text-subtitle-1 font-weight-medium">{{ course.name }}</div>
        <div>
          <v-btn icon variant="text" @click="openEditDialog(course)">
            <v-icon icon="mdi-pencil" />
          </v-btn>
          <v-btn icon variant="text" @click="deleteCourse(course.id)">
            <v-icon icon="mdi-delete" />
          </v-btn>
        </div>
      </v-card>

      
      <v-dialog persistent v-model="isDialogOpen" width="500">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">{{ isEditing ? 'Edit' : 'Add' }} Course</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="editedCourse.name"
              label="Course Name"
              required
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="secondary" @click="isDialogOpen = false">Cancel</v-btn>
            <v-btn color="primary" @click="saveCourse">{{ isEditing ? 'Update' : 'Add' }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      
      <v-snackbar v-model="snackbar.value" rounded="pill">
        {{ snackbar.text }}
        <template v-slot:actions>
          <v-btn :color="snackbar.color" variant="text" @click="snackbar.value = false">Close</v-btn>
        </template>
      </v-snackbar>
    </div>
  </v-container>
</template>
