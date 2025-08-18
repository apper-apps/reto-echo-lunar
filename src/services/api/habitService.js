import habitsData from "@/services/mockData/habits.json";

let habits = [...habitsData];

export const habitService = {
  async getAllHabits() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return JSON.parse(JSON.stringify(habits));
  },

  async getTodayHabits() {
    await new Promise(resolve => setTimeout(resolve, 250));
    // Return all habits as today's habits for demo
    return JSON.parse(JSON.stringify(habits));
  },

  async getHabitsForDay(day) {
    await new Promise(resolve => setTimeout(resolve, 250));
    // Return all habits for any given day (mock behavior)
    return JSON.parse(JSON.stringify(habits));
  },

  async createHabit(habitData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const maxId = habits.length > 0 ? Math.max(...habits.map(h => h.Id)) : 0;
    const newHabit = {
      Id: maxId + 1,
      name: habitData.name,
      category: habitData.category,
      target: habitData.target || null,
      unit: habitData.unit || null,
      status: "incomplete",
      currentValue: 0,
      createdAt: new Date().toISOString()
    };
    
    habits.push(newHabit);
    return JSON.parse(JSON.stringify(newHabit));
  },

  async updateHabit(habitId, habitData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const habitIndex = habits.findIndex(h => h.Id === habitId);
    if (habitIndex === -1) {
      throw new Error("Hábito no encontrado");
    }
    
    habits[habitIndex] = {
      ...habits[habitIndex],
      ...habitData
    };
    
    return JSON.parse(JSON.stringify(habits[habitIndex]));
  },

  async deleteHabit(habitId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const habitIndex = habits.findIndex(h => h.Id === habitId);
    if (habitIndex === -1) {
      throw new Error("Hábito no encontrado");
    }
    
    habits.splice(habitIndex, 1);
    return true;
  },

async toggleHabitStatus(habitId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const habitIndex = habits.findIndex(h => h.Id === habitId);
    if (habitIndex === -1) {
      throw new Error("Hábito no encontrado");
    }
    
    const habit = habits[habitIndex];
    
    // Ensure habit has required properties with safe defaults
    if (typeof habit.target === 'undefined' || habit.target === null) {
      habit.target = 1;
    }
    if (typeof habit.currentValue === 'undefined' || habit.currentValue === null) {
      habit.currentValue = 0;
    }
    if (!habit.status) {
      habit.status = "incomplete";
    }
    
    // Cycle through statuses: incomplete -> partial -> completed -> incomplete
    switch (habit.status) {
      case "incomplete":
        habit.status = "partial";
        habit.currentValue = Math.max(1, Math.floor(habit.target / 2));
        break;
      case "partial":
        habit.status = "completed";
        habit.currentValue = habit.target;
        break;
      case "completed":
        habit.status = "incomplete";
        habit.currentValue = 0;
        break;
      default:
        habit.status = "incomplete";
        habit.currentValue = 0;
    }
    
    return JSON.parse(JSON.stringify(habit));
  }
};